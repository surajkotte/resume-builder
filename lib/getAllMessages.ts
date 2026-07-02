"use server";
import { cookies } from "next/headers";
import JWT, { JwtPayload } from "jsonwebtoken";
import { sqldb } from "@/lib/dbConnection";

interface UserTokenPayload extends JwtPayload {
  id: string;
}
type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  progress?: string[];
  isStreaming?: boolean;
};

export async function getAllMessagesByConversationId(conversationId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { messageType: "E", message: "User not authenticated" };
  }

  try {
    const decoded = JWT.verify(
      token,
      process.env.JWT_SECRET!,
    ) as UserTokenPayload;
    const userId = decoded.id;

    const [rows]: any = await sqldb.execute(
      `SELECT id, content, role, token_count, model_version 
       FROM messages 
       WHERE conversation_id = ? order by created_at`,
      [conversationId],
    );

    return { messageType: "S", data: rows as ChatMessage[] };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { messageType: "E", message: "Failed to fetch messages" };
  }
}
