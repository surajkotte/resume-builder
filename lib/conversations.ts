"use server";

import { cookies } from "next/headers";
import JWT, { JwtPayload } from "jsonwebtoken";
import { sqldb } from "@/lib/dbConnection";
import { v4 as uuidv4 } from "uuid";
interface UserTokenPayload extends JwtPayload {
  id: string;
}

export async function createNewConversation() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = JWT.verify(
      token,
      process.env.JWT_SECRET!,
    ) as UserTokenPayload;
    const userId = decoded.id;
    const uniqueId = uuidv4(); // Generate a unique ID for the conversation
    const [rows]: any = await sqldb.execute(
      `INSERT INTO conversations (id, user_id) VALUES (?, ?)`,
      [uniqueId, userId],
    );

    const conversationId = rows.uniqueId || uniqueId; // Use the generated unique ID if the database doesn't return one

    return { conversationId };
  } catch (error) {
    console.error("Failed to create new conversation:", error);
    return null;
  }
}

export async function updateConversationTitle(
  conversationId: string,
  title: string,
) {
  const [rows]: any = await sqldb.execute(
    `UPDATE conversations SET title = ? WHERE id = ?`,
    [title, conversationId],
  );
}

export async function getAllUserConversations() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = JWT.verify(
      token,
      process.env.JWT_SECRET!,
    ) as UserTokenPayload;
    const userId = decoded.id;

    const [rows]: any = await sqldb.execute(
      `SELECT id, title, created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
    );
    console.log("Fetched Conversations:", rows);
    return rows || null;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

export async function updateMessageInConversation(
  conversationId: string,
  messageId: string,
  newContent: string,
  role: string,
  tokenCount: number,
  model_version: string,
) {
  try {
    const [rows]: any = await sqldb.execute(
      `UPDATE messages SET content = ?, role = ?, token_count = ?, model_version = ? WHERE id = ? AND conversation_id = ?`,
      [newContent, role, tokenCount, model_version, messageId, conversationId],
    );
    if (rows.affectedRows === 0) {
      throw new Error("No message found to update");
    } else {
      return { messageType: "S", message: "Message updated successfully" };
    }
  } catch (error) {
    console.error("Failed to update message in conversation:", error);
    return { messageType: "E", message: "Failed to update message" };
  }
}
