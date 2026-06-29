// app/actions.ts
"use server"; // Marks all functions in this file as Server Actions
import { sqldb } from "@/lib/dbConnection"; // Your exported MySQL connection pool
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function createNewUser(
  prevState: any,
  formData: FormData,
): Promise<{ messageType: string; message: string } | undefined> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  try {
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      throw new Error("Invalid form data");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const response = await sqldb.execute(
      "INSERT INTO users (id, username, email_address, password) VALUES (?, ?, ?, ?)",
      [id, name, email, passwordHash],
    );
    console.log(response);
    if (response) {
      const token = JWT.sign({ id: id }, "hellothere", {
        expiresIn: "2h",
      });
      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true, // Prevents client-side JS (XSS) from reading the token
        secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in prod
        sameSite: "strict", // Prevents CSRF attacks
        maxAge: 60 * 60 * 2, // 2 hours in seconds
        path: "/", // Cookie is available across the entire app
      });
      return {
        messageType: "success",
        message: "Account created successfully!",
      };
    } else {
      console.log("error");
      return {
        messageType: "E",
        message: "Unable to create user, Please contact system administrator",
      };
    }
  } catch (error) {
    console.error(error);
    return { messageType: "error", message: "Database error occurred." };
  }
  //return { id, name, email };
}
export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { messageType: "error", message: "Invalid email or password" };
  }

  try {
    // 1. Look up user by email
    const [rows]: any = await sqldb.execute(
      "SELECT id, password FROM users WHERE email_address = ? LIMIT 1",
      [email],
    );

    if (rows.length === 0) {
      return { messageType: "error", message: "Invalid email or password" };
    }

    const user = rows[0];

    // 2. Compare the plain-text password with the stored bcrypt hash
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return { messageType: "error", message: "Invalid email or password" };
    }

    // 3. Passwords match! Generate JWT and set Cookie
    const token = JWT.sign(
      { id: user.id },
      process.env.JWT_SECRET || "hellothere",
      {
        expiresIn: "2h",
      },
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    //return { messageType: "success", message: "Logged in successfully!" };
  } catch (error) {
    console.error("Login error:", error);
    return { messageType: "error", message: "Database error occurred." };
  }
  redirect("/chat");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/");
}
