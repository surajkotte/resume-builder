# AI Career Coach — Resume Tailoring & ATS Scoring Agent

An agentic backend that tailors resumes to job descriptions, scores them against
ATS-style keyword matching, and analyzes skill gaps against a candidate's GitHub
project history — exposed as a chat experience via a Next.js frontend.

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────────────────────────┐
│   Next.js Chat UI    │  HTTP  │            Python Microservice (FastAPI)      │
│  - message input     │ ─────► │                                                │
│  - thread history     │        │   ┌────────────────────────────────────────┐ │
│  - streaming display  │ ◄───── │   │           LangGraph Orchestrator         │ │
└─────────────────────┘        │   │                                          │ │
                                │   │        START                             │ │
                                │   │          │                               │ │
                                │   │          ▼                               │ │
                                │   │      [ router ]  intent_router (LLM)     │ │
                                │   │       /      \                           │ │
                                │   │  create_resume  general_chat             │ │
                                │   │      │              │                    │ │
                                │   │      ▼              ▼                    │ │
                                │   │ [ prep_router ]  [ general_agent ]       │ │
                                │   │  /          \    react-agent w/ tools:   │ │
                                │   │ resume_    github_    - resume_extraction│ │
                                │   │ extraction readme     - github_readme    │ │      
                                │   │      \      /         - get_atc_score    │ │              Observabilit/eval
                                │   │       ▼    ▼          - analyze_skill_gaps│ │  ---->         LangSmith
                                |   |          |                    |          | |    
                                |   |          ▼                    ▼          | |
                                |   |     [pii_detetor]            END         | |
                                |   |           |                              | |
                                |   |           ▼                              | |
                                │   │  [ resume_creation ]                     │ │
                                │   │        │                                 │ │
                                │   │        ▼                                 │ │
                                │   │  [ atc_checker ]                         │ │
                                │   │    │  retry loop (score<85, retries<=3)  │ │
                                │   │    ▼                                     │ │
                                │   │ [ skill_gap_analyzer ] ──► END           │ │
                                │   └────────────────────────────────────────┘ │
                                │                                                │
                                │   ┌───────────────┐   ┌────────────────────┐ │
                                │   │  Checkpointer  │   │       Store         │ │
                                │   │ (PostgresSaver)│   │  (PostgresStore)    │ │
                                │   │ thread-scoped  │   │  cross-thread /     │ │
                                │   │ conversation   │   │  user-scoped        │ │
                                │   │ state + replay │   │  long-term memory   │ │
                                │   └───────────────┘   └────────────────────┘ │
                                └──────────────────────────────────────────────┘
                                           │                       │
                                           ▼                       ▼
                                ┌─────────────────┐     ┌─────────────────────┐
                                │   PostgreSQL     │     │  External Sources    │
                                │  - checkpoints   │     │  - GitHub API        │
                                │  - store k/v     │     │  - Resume file store │
                                │  - (optional)     │     │    (S3/MinIO)        │
                                │    ui messages    │     └─────────────────────┘
                                └─────────────────┘
```

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
Handled by a single ReAct agent with four tools (`resume_extraction`,
`github_readme`, `get_atc_score`, `analyze_skill_gaps`), each closed over the
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
