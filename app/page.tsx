// app/page.tsx  <-- Notice: NO "use client" at the top!
import { cookies } from "next/headers";
import JWT from "jsonwebtoken";
import { AuthForm } from "@/components/auth/auth-form";
import { redirect } from "next/navigation";
type Props = {
  searchParams: Promise<{ mode?: string }>; // Next.js 15 standard
};

export default async function GatekeeperPage({ searchParams }: Props) {
  // 1. Intercept the incoming HTTP request and check for the cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    try {
      // 2. Cryptographically verify the cookie hasn't been tampered with
      const decoded: any = JWT.verify(
        token,
        process.env.JWT_SECRET || "hellothere",
      );
      console.log("in default page");
      // 3. Token is 100% valid. Render the private app!
      return redirect("/chat")
    } catch (err) {
      // Token was expired, or someone typed fake gibberish into their dev tools.
      // We swallow the error and let the code fall through to the Login Form.
    }
  }

  // 4. If we made it here, the user is unauthenticated.
  // Check the URL (e.g. localhost:3000/?mode=signup) to see which form to show
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "login";
  console.log(mode);
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <AuthForm mode={mode} />
    </main>
  );
}
