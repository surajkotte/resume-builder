import { User, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  progress?: string[];
  isStreaming?: boolean;
};

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-purple-600"
            : "bg-linear-to-tr from-blue-500 to-indigo-600"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Sparkles className="h-4 w-4 text-white animate-pulse" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`rounded-2xl px-5 py-3.5 max-w-[80%] text-sm leading-relaxed ${
          isUser
            ? "bg-gray-800 text-white rounded-tr-none"
            : "bg-transparent text-gray-200 border border-gray-800/80 rounded-tl-none shadow-sm"
        }`}
      >
        {/* Streaming Progress */}
        {message.isStreaming && (
          <div className="space-y-1.5">
            {(message.progress ?? []).map((p, i) => (
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

        {/* AI Markdown Output */}
        {!message.isStreaming && !isUser && (
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
                  <ul className="list-disc pl-5 mb-2 space-y-0.5" {...p} />
                ),
                ol: (p) => (
                  <ol className="list-decimal pl-5 mb-2 space-y-0.5" {...p} />
                ),
                li: (p) => <li className="text-gray-200" {...p} />,
                strong: (p) => (
                  <strong className="font-semibold text-white" {...p} />
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
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {!message.isStreaming && isUser && (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>
    </div>
  );
}
