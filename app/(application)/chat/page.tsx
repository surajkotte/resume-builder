"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChatHook } from "@/hooks/useChatHook";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
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

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const threadIdRef = useRef<string | null>(null);
  const {
    startNewChat,
    history,
    setHistory,
    messages,
    setMessages,
    threadId,
    setNewConversationTitle,
    updateMessage,
    fetchMessages,
    profile,
  } = useChatHook();

  // Sync threadId to ref so async functions always have the latest ID
  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

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

    const getCurrentThreadId = () => threadId ?? threadIdRef.current ?? "";

    const updateThreadMessage = async (
      messageId: string,
      content: string,
      role: "user" | "bot",
      tokenCount: number,
      model: string,
    ) => {
      const currentThreadId = getCurrentThreadId();
      if (!currentThreadId) return;
      await updateMessage(
        currentThreadId,
        messageId,
        content,
        role,
        tokenCount,
        model,
      );
    };

    const currentThreadId = getCurrentThreadId();
    console.log("Sending message:", userMessage, "to thread:", currentThreadId);

    updateThreadMessage(
      userMessage.id,
      userText,
      "user",
      0,
      "gemini-2.5-flash",
    );

    setInput("");
    setSending(true);

    const updateBotMessage = (patch: Partial<ChatMessage>) => {
      if (messages.length === 1 && currentThreadId) {
        setNewConversationTitle(
          currentThreadId,
          input.substring(0, 50) || "New Conversation",
        );
      }
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
          thread_id: currentThreadId,
          username: "surajkotte",
          resume_url: profile?.resume_url,
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
          } else if (evt.type === "progress") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMessageId
                  ? { ...m, progress: [...(m.progress ?? []), evt.label] }
                  : m,
              ),
            );
          } else if (evt.type === "done") {
            let finalText: string = evt.new_resume_markdown
              ? `**ATC score: ${evt.atc_score}/100**\n\n${evt.new_resume_markdown}`
              : evt.chat_response || "I couldn't produce a response for that.";
            console.log(finalText);
            finalText =
              finalText[0]["text"]?.replace("<PHONE_NUMBER>", profile?.phone) ||
              finalText?.replace("<PHONE_NUMBER>", profile?.phone);
            finalText =
              finalText[0]?.text?.replace(
                "EMAIL_ADDRESS",
                "vsssurajkotte@gmail.com",
              ) ||
              finalText.replace("EMAIL_ADDRESS", "vsssurajkotte@gmail.com");
            updateThreadMessage(
              botMessageId,
              finalText,
              "bot",
              Number(evt?.token_count || 0),
              "gemini-2.5-flash",
            );

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
            updateThreadMessage(
              botMessageId,
              evt?.message[0].text || evt?.message || "Unknown error",
              "bot",
              Number(evt?.token_count || 0),
              "gemini-2.5-flash",
            );
          }
        }
      }
    } catch (err) {
      updateBotMessage({
        content: `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
        progress: [],
        isStreaming: false,
      });
      updateThreadMessage(
        botMessageId,
        err instanceof Error ? err.message : String(err) || "Unknown error",
        "bot",
        0,
        "gemini-2.5-flash",
      );
      console.error("Error during chat streaming:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] w-full overflow-hidden">
      <ChatSidebar
        history={history}
        onNewChat={startNewChat}
        onRemoveHistory={(id) =>
          setHistory((prev) => prev.filter((h) => h.id !== id))
        }
        onSelectHistory={(id) => fetchMessages(id)}
      />

      <div className="flex flex-1 flex-col justify-between bg-gray-950 relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <ChatMessageBubble messages={messages} />
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          sending={sending}
        />
      </div>
    </div>
  );
}
