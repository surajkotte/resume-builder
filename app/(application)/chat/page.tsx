"use client";

import { useState } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import { logout } from "@/app/(authActions)/actions";
// Dummy initial data
const INITIAL_MESSAGES = [
  {
    role: "bot",
    content:
      "Hello Suraj! I am your AI assistant. How can we accelerate your Resume Builder project today?",
  },
];

const DUMMY_HISTORY = [
  { id: "1", title: "Fixing auth-form TS errors" },
  { id: "2", title: "Next.js MySQL Connection Pool" },
  { id: "3", title: "Tailwind layout debugging" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(DUMMY_HISTORY);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add User Message
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "That sounds like a great plan! Let me generate the code for that implementation.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* LEFT/CENTER: Main Chat Interface */}
      <aside className="w-80 border-l border-gray-800 bg-gray-900/40 flex flex-col md:flex">
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-800/80">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 py-3 text-sm font-medium text-white transition hover:bg-gray-700 border border-gray-700/50">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
              <button className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

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
            {messages.map((msg, index) => (
              <div
                key={index}
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
                  {msg.content}
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
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Gemini anything..."
              className="w-full rounded-full border border-gray-800 bg-gray-900 py-4 pl-6 pr-14 text-sm text-white placeholder-gray-500 shadow-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
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
