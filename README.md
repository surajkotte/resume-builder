# AI Career Coach — Resume Tailoring & ATS Scoring Agent

An agentic backend that tailors resumes to job descriptions, scores them against
ATS-style keyword matching, and analyzes skill gaps against a candidate's GitHub
project history — exposed as a chat experience via a Next.js frontend.

---

## Architecture

```
## Architecture

```text
┌─────────────────────┐        ┌──────────────────────────────────────────────┐
│   Next.js Chat UI   │  HTTP  │            Python Microservice (FastAPI)     │
│  - message input    │ ─────► │  [ Input Guardrails & Pydantic Validation ]  │
│  - JD payload       │        │                          │                   │
│  - thread history   │ ◄───── │   ┌──────────────────────▼───────────────┐   │
│  - streaming display│  SSE   │   │          LangGraph Orchestrator        │   │
└─────────────────────┘        │   │                                        │   │
                               │   │               START                    │   │
                               │   │                 │                      │   │
                               │   │                 ▼                      │   │
                               │   │             [ router ]                 │   │
                               │   │            /          \                │   │
                               │   │    create_resume   general_chat        │   │
                               │   │          │               │             │   │
                               │   │          ▼               ▼             │   │
                               │   │  [ extract_job_  [ general_agent ]     │   │
                               │   │    description]   (ReAct Agent)        │   │
                               │   │    (formatter)       Tools:            │   │
                               │   │          │          - resume_extraction│   │
                               │   │          ▼          - github_readme    │   │
                               │   │   [ prep_router ]   - get_ats_score    │   │
                               │   │     /         \     - analyze_skill_gap│   │
                               │   │ resume_      github_  - Job Search     │   │
                               │   │ extraction   readme        │           │   │
                               │   │     \         /            │           │   │
                               │   │      ▼       ▼             │           │   │
                               │   │          │                 │           │   │
                               │   │          ▼                 │           │   │
                               │   │   [ pii_detector ]         │           │   │
                               │   │          │                 │           │   │
                               │   │          ▼                 │           │   │
                               │   │ [ resume_creation ]        │           │   │
                               │   │          │                 │           │   │
                               │   │          ▼                 │           │   │
                               │   │   [ ats_checker ]          │           │   │
                               │   │          │  retry loop     │           │   │
                               │   │          ▼                 │           │   │
                               │   │ [ skill_gap_analyzer ]     │           │   │
                               │   │          │                 │           │   │
                               │   │          ▼                 ▼           │   │
                               │   │  [ Output Guardrails ] ────┘           │   │
                               │   │          │                             │   │
                               │   │          ▼                             │   │
                               │   │         END                            │   │
                               │   └──────────────────────────────────────┘   │
                               │                                              │
                               │   ┌───────────────┐  ┌────────────────────┐  │
                               │   │  Checkpointer │  │        Store       │  │
                               │   │(PostgresSaver)│  │  (PostgresStore)   │  │
                               │   │ thread-scoped │  │  cross-thread /    │  │
                               │   │ conversation  │  │   user-scoped      │  │
                               │   │ state + replay│  │  long-term memory  │  │
                               │   └───────────────┘  └────────────────────┘  │
                               └──────────────────────────────────────────────┘
                                           │                       │
                                           ▼                       ▼
                                ┌─────────────────┐     ┌─────────────────────┐
                                │   PostgreSQL    │     │  External Sources   │
                                │  - checkpoints  │     │  - GitHub API       │
                                │  - store k/v    │     │  - Resume file store│
                                │  - (optional)   │     │    (S3/MinIO)       │
                                │    ui messages  │     └─────────────────────┘
                                └─────────────────┘
```

## Security & Guardrails

To ensure safe, accurate, and stable AI interactions, the system implements strict guardrails at two critical choke points: the **Input Gateway** (before the AI processes data) and the **Output Generation Layer** (before data is streamed to the user).

### 1. Input Guardrails (FastAPI Gateway)
Before a user's request is ever allowed to invoke the LangGraph agent, it must pass through the FastAPI router's defensive layer:
* **Payload Separation & Intent Clarification:** If a user pastes a massive job description, it is deliberately separated from the conversational `message` payload. This prevents "context confusion" (where the LLM mistakes JD text for system instructions) and allows the AI Router to classify intents instantly and cheaply.
* **Strict Pydantic Validation (Structural Guardrails):** The API enforces hard character limits (e.g., 2,000 characters for chat messages, 20,000 for job descriptions). This intercepts buffer overflow attempts, infinite-payload DDoS attacks, and excessive token-burning before the LLM is triggered.
* **SSRF (Server-Side Request Forgery) Protection:** Because the Next.js frontend sends a `resume_url` for the backend to download, a malicious user could potentially pass an internal IP address to map out the server network. The gateway validates that the URL strictly resolves to the trusted internal MinIO/S3 storage bucket domain before executing the `boto3` fetch command.

### 2. Output Guardrails (LangGraph End-State)
Because LLMs are inherently non-deterministic, the final nodes of the LangGraph act as quality control gatekeepers before yielding the final Server-Sent Events (SSE) stream back to Next.js:
* **PII Detection Node (Data Privacy):** Before drafting the final resume, the graph routes the extracted text through a specialized redaction node. This ensures that sensitive Personally Identifiable Information (like exact phone numbers or personal addresses) is properly handled and not accidentally leaked into general LLM reasoning caches.
* **Hallucination Prevention (Fact-Checking):** A common flaw in AI resume builders is inventing skills to match a job description. The final formatting node acts as a cross-referencing guardrail—it compares the newly generated resume markdown against the original parsed CV and GitHub data, actively stripping out any phantom job titles or fabricated tech stacks.
* **Structured Output Validation:** The UI relies on specific data types (e.g., `atc_score` must be a number from 0-100, `skill_gap` must be a specific JSON array). The output guardrail forces the final LLM response through a strict Pydantic parser. If the LLM generates conversational text like *"Your score is 85"*, the guardrail extracts just the integer `85`, guaranteeing the Next.js frontend won't crash when parsing the stream.

### Two flows through one graph

**Flow 1 — Resume creation** (`intent = create_resume`)
User asks for a resume to be written or tailored to a JD.
`prep_router` conditionally branches into `resume_extraction` and/or `github_readme`
depending on what's missing from state, both converge into Pii_detector which redacts personal informations
followed by`resume_creation`, which
feeds `atc_checker`. If the score is below threshold and retries remain, it loops
back into `resume_creation` with the prior analysis as feedback; otherwise it
proceeds to `skill_gap_analyzer` and ends.

**Flow 2 — General Q&A** (`intent = general_chat`)
Everything that isn't a request to produce/rewrite resume content: ATS score
checks, skill gap analysis, "which of my projects fit this JD," career advice.
Handled by a single ReAct agent with five tools (`resume_extraction`,
`github_readme`, `get_atc_score`, `analyze_skill_gaps`, `Job_search`), each closed over the
current turn's state/context so the LLM never has to re-type large text blobs
as tool arguments.

---

## Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | **Next.js** | Chat UI, thread list, streaming responses |
| Orchestration | **LangGraph** | Stateful multi-node agent graph, conditional routing, retry loops |
| Agent framework | **LangChain** (`create_agent` / ReAct) | Tool-calling agent for the general-chat flow |
| LLM | **Gemini 2.5 Flash-Lite** (`langchain-google-genai`) | Structured output for resume synthesis, ATS scoring, skill-gap analysis, intent classification |
| Backend service | **Python microservice** (FastAPI assumed) | Exposes graph invocation as an HTTP API to the Next.js frontend |
| Short-term memory | **LangGraph Checkpointer** (`PostgresSaver`) | Thread-scoped conversation state, crash recovery, time-travel/replay |
| Long-term memory | **LangGraph Store** (`PostgresStore`) | Cross-thread, user-scoped facts (preferences, prior analyses) |
| Database | **PostgreSQL** | Backing store for both checkpointer and store, plus optional UI-facing message table |
| External data | **GitHub API**, resume file storage (S3/MinIO-style) | Source evidence for tailoring and skill-gap analysis |
| Validation | **Pydantic** | Structured LLM State outputs |

---
