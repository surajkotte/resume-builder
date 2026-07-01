"use server";
import { cookies } from "next/headers";
import JWT, { JwtPayload } from "jsonwebtoken";
import { sqldb } from "@/lib/dbConnection";

interface UserTokenPayload extends JwtPayload {
  id: string;
}
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  token_count: number;
  model_version: string;
}

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
       WHERE conversation_id = ? AND user_id = ?`,
      [conversationId, userId],
    );

    return { messageType: "S", data: rows as Message[] };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { messageType: "E", message: "Failed to fetch messages" };
  }
}
