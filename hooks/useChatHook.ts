"use client";
import { useState, useEffect } from "react";
import {
  getAllUserConversations,
  createNewConversation,
} from "../lib/conversations";
import { getAllMessagesByConversationId } from "../lib/getAllMessages";
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  token_count: number;
  model_version: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}
export const useChatHook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [newComversationClicked, setNewConversationClicked] = useState(false);
  useEffect(() => {
    async function fetchConversations() {
      const conversations = await getAllUserConversations();
      console.log("Fetched Conversations:", conversations);
      if (conversations) {
        setHistory(conversations);
      } else {
        setHistory([]);
      }
    }
    async function fetchMessages() {
      if (threadId) {
        const response = await getAllMessagesByConversationId(threadId);
        if (response?.messageType === "S") {
          const rows = response.data ?? [];
          setMessages(rows);
        } else {
          setMessages([]);
        }
      }
    }
    fetchMessages();
    fetchConversations();
  }, []);

  useEffect(() => {
    const getNewThreadId = async () => {
      const newThreadId: any = await getAllUserConversations();
      setThreadId(newThreadId?.conversationId || null);
    };
    getNewThreadId();
  }, []);

  const startNewChat = async () => {
    setMessages([]);
    const response = await createNewConversation();
    if (response) {
      setThreadId(response.conversationId);
    } else {
      console.error("Failed to create a new conversation.");
    }
  };

  return {
    messages,
    setMessages,
    startNewChat,
    threadId,
    setThreadId,
    history,
    setHistory,
    setNewConversationClicked,
  };
};
