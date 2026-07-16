"use client";

import { useState, useEffect } from "react";
import {
  getAllUserConversations,
  createNewConversation,
  updateConversationTitle,
  updateMessageInConversation,
  deleteConversation,
} from "../lib/conversations";
import { getLoggedinProfile } from "../lib/getProfile";
import { getAllMessagesByConversationId } from "../lib/getAllMessages";
import { v4 as uuidv4 } from "uuid";
type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  progress?: string[];
  isStreaming?: boolean;
};

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "bot",
    content:
      "Hello! I am your AI assistant. How can we accelerate your Resume Builder project today?",
    isStreaming: false,
  },
];

export const useChatHook = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<any>(null);

  async function fetchMessages(selectedThreadId: string | null) {
    if (selectedThreadId) {
      setThreadId(selectedThreadId);
      const response = await getAllMessagesByConversationId(selectedThreadId);
      if (response?.messageType === "S") {
        const rows = response.data ?? [];
        setMessages(rows.length > 0 ? rows : INITIAL_MESSAGES);
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    }
  }

  async function fetchConversations() {
    const conversations = await getAllUserConversations();
    console.log("Fetched Conversations:", conversations);
    if (conversations && conversations.length > 0) {
      setHistory(conversations);
      // Automatically select the most recent conversation if no thread is set
      if (!threadId) {
        setThreadId(conversations[0].id);
      }
    } else {
      setHistory([]);
    }
  }

  // Fetch initial history on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages whenever threadId changes
  useEffect(() => {
    if (threadId) {
      fetchMessages(threadId);
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, [threadId]);

  const setNewConversationTitle = async (
    conversationId: string,
    title: string,
  ) => {
    await updateConversationTitle(conversationId, title);
    setHistory((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, title } : conv,
      ),
    );
  };

  const startNewChat = async () => {
    setMessages(INITIAL_MESSAGES);
    const response = await createNewConversation();
    console.log("New conversation created:", response?.conversationId);
    if (response?.conversationId) {
      updateMessage(
        response.conversationId,
        uuidv4(),
        INITIAL_MESSAGES[0].content,
        INITIAL_MESSAGES[0].role,
        0,
        "gemini=2.5-flash",
      );
      setThreadId(response.conversationId);
      fetchConversations(); // Refresh the sidebar
    } else {
      console.error("Failed to create a new conversation.");
    }
  };

  const updateMessage = async (
    conversationId: string,
    messageId: string,
    newContent: string,
    role: string,
    tokenCount: number,
    model_version: string,
  ) => {
    console.log("Updating message:", {
      conversationId,
      messageId,
      newContent,
      role,
      tokenCount,
      model_version,
    });
    try {
      const response = await updateMessageInConversation(
        conversationId,
        messageId,
        newContent,
        role,
        tokenCount,
        model_version,
      );
      console.log("Update message response:", response);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };
  const fetchProfile = async () => {
    const profile = await getLoggedinProfile();
    if (profile) {
      setProfile(profile);
    } else {
      console.error("Failed to fetch user profile.");
    }
  };

  const deleteConversations = async (id) => {
    try {
      const response = await deleteConversation(id);
      return response;
    } catch (error) {}
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    messages,
    setMessages,
    startNewChat,
    threadId,
    setThreadId,
    fetchMessages,
    fetchConversations,
    history,
    setHistory,
    updateMessage,
    deleteConversations,
    profile,
    setNewConversationTitle,
  };
};
