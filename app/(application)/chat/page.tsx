"use client";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
// import ChatInput from "@/components/chat/ChatInput";
// import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChatHook } from "@/hooks/useChatHook";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const THREAD_STORAGE_KEY = "resume_thread_id";
const CURRENT_USER = {
  username: "surajkotte",
  resume_url:
    "http://localhost:9000/resume-builder-bucket/0ec700ad-ae06-40ef-a95e-741b962befed-cv_vsssuraj_kotte.pdf",
};

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  progress?: string[];
  isStreaming?: boolean;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "bot",
    content:
      "Hello ! I am your AI assistant. How can we accelerate your Resume Builder project today?",
  },
];

const DUMMY_HISTORY = [
  { id: "1", title: "Fixing auth-form TS errors" },
  { id: "2", title: "Next.js MySQL Connection Pool" },
  { id: "3", title: "Tailwind layout debugging" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const threadIdRef = useRef<string | null>(null);
  const { startNewChat, history, setHistory } = useChatHook();
  useEffect(() => {
    threadIdRef.current = localStorage.getItem(THREAD_STORAGE_KEY);
  }, []);

  // async function startNewChat() {
  //   setMessages(INITIAL_MESSAGES);
  //   const response = await createNewConversation();
  //   setThreadId(response?.conversationId || null);
  //   threadIdRef.current = response?.conversationId || null;
  //   localStorage.setItem(THREAD_STORAGE_KEY, response?.conversationId || "");
  // }

  async function handleSend() {
    if (!input.trim() || sending) return;

    const userText = input;
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: userText,
    };
    const botMessageId = uuidv4();
    const botPlaceholder: ChatMessage = {
      id: botMessageId,
      role: "bot",
      content: "",
      progress: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, botPlaceholder]);
    setInput("");
    setSending(true);

    const updateBotMessage = (patch: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === botMessageId ? { ...m, ...patch } : m)),
      );
    };

    try {
      const res = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          thread_id: threadId,
          username: CURRENT_USER.username,
          resume_url: CURRENT_USER.resume_url,
        }),
      });
      console.log("Response from backend:", res);
      if (!res.body) throw new Error("No response body from server");

      const reader = res.body.getReader();
      console.log("Reader created:", reader);
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data:")) continue;
          const evt = JSON.parse(line.slice(5).trim());

          if (evt.type === "thread") {
            threadIdRef.current = evt.thread_id;
            localStorage.setItem(THREAD_STORAGE_KEY, evt.thread_id);
          } else if (evt.type === "progress") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMessageId
                  ? { ...m, progress: [...(m.progress ?? []), evt.label] }
                  : m,
              ),
            );
          } else if (evt.type === "done") {
            const finalText = evt.new_resume_markdown
              ? `**ATC score: ${evt.atc_score}/100**\n\n${evt.new_resume_markdown}`
              : evt.chat_response || "I couldn't produce a response for that.";
            updateBotMessage({
              content: finalText,
              progress: [],
              isStreaming: false,
            });
          } else if (evt.type === "error") {
            updateBotMessage({
              content: `Something went wrong: ${evt.message}`,
              progress: [],
              isStreaming: false,
            });
          }
        }
      }
    } catch (err) {
      updateBotMessage({
        content: `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
        progress: [],
        isStreaming: false,
      });
      console.error("Error during chat streaming:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* LEFT/CENTER: Main Chat Interface */}
      <aside className="w-80 border-l border-gray-800 bg-gray-900/40 flex flex-col md:flex">
        <ChatSidebar
          history={history}
          onNewChat={startNewChat}
          onRemoveHistory={(id) =>
            setHistory((prev) => prev.filter((h) => h.id !== id))
          }
        />
        {/* New Chat Button */}
        {/* <div className="p-4 border-b border-gray-800/80">
          <button
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 py-3 text-sm font-medium text-white transition hover:bg-gray-700 border border-gray-700/50"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div> */}

        {/* History List */}
        {/* <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Chats
          </p>

          {history.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-gray-800/60 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare className="h-4 w-4 text-gray-500 group-hover:text-blue-400 shrink-0" />
                <span className="truncate text-xs">{item.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHistory((prev) => prev.filter((h) => h.id !== item.id));
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div> */}

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center">
          <span>Pro Plan Active</span>
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
        </div>
      </aside>
      <div className="flex flex-1 flex-col justify-between bg-gray-950 relative">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-purple-600" : "bg-linear-to-tr from-blue-500 to-indigo-600"}`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-5 py-3.5 max-w-[80%] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gray-800 text-white rounded-tr-none"
                      : "bg-transparent text-gray-200 border border-gray-800/80 rounded-tl-none shadow-sm"
                  }`}
                >
                  {/* Live progress while the graph is running */}
                  {msg.isStreaming && (
                    <div className="space-y-1.5">
                      {(msg.progress ?? []).map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <span className="h-1 w-1 rounded-full bg-blue-400" />
                          {p}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Working…
                      </div>
                    </div>
                  )}

                  {!msg.isStreaming && msg.role === "bot" && (
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: (p) => (
                            <h1
                              className="text-lg font-semibold text-white mt-3 mb-2 first:mt-0"
                              {...p}
                            />
                          ),
                          h2: (p) => (
                            <h2
                              className="text-base font-semibold text-white mt-3 mb-1.5 first:mt-0"
                              {...p}
                            />
                          ),
                          h3: (p) => (
                            <h3
                              className="text-sm font-semibold text-gray-100 mt-2.5 mb-1"
                              {...p}
                            />
                          ),
                          p: (p) => <p className="mb-2 last:mb-0" {...p} />,
                          ul: (p) => (
                            <ul
                              className="list-disc pl-5 mb-2 space-y-0.5"
                              {...p}
                            />
                          ),
                          ol: (p) => (
                            <ol
                              className="list-decimal pl-5 mb-2 space-y-0.5"
                              {...p}
                            />
                          ),
                          li: (p) => <li className="text-gray-200" {...p} />,
                          strong: (p) => (
                            <strong
                              className="font-semibold text-white"
                              {...p}
                            />
                          ),
                          a: (p) => (
                            <a
                              className="text-blue-400 underline hover:text-blue-300"
                              target="_blank"
                              rel="noreferrer"
                              {...p}
                            />
                          ),
                          hr: () => <hr className="border-gray-800 my-3" />,
                          code: (p) => (
                            <code
                              className="rounded bg-gray-800 px-1 py-0.5 text-xs"
                              {...p}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {!msg.isStreaming && msg.role === "user" && (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Prompt Input at Bottom */}
        <div className="p-4 bg-gray-950 border-t border-gray-900/50">
          <div className="mx-auto max-w-3xl relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
              placeholder="Ask Gemini anything..."
              disabled={sending}
              className="w-full rounded-full border border-gray-800 bg-gray-900 py-4 pl-6 pr-14 text-sm text-white placeholder-gray-500 shadow-lg focus:border-blue-500 focus:outline-none disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-600 mt-2">
            Gemini can make mistakes. Verify important resume data.
          </p>
        </div>
      </div>
    </div>
  );
}
