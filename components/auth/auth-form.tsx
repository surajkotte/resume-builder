"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// 1. Import BOTH server actions
import { createNewUser, loginUser } from "@/app/(authActions)/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { SocialButtons } from "@/components/auth/social-buttons";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const isLogin = mode === "login";

  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  // 2. Set up two separate Hooks for the two separate backend routes
  const [signupState, signupAction, isSigningUp] = useActionState(
    createNewUser,
    null,
  );
  const [loginState, loginAction, isLoggingIn] = useActionState(
    loginUser,
    null,
  );

  // 3. Dynamically pick which state/action to use based on the current page mode
  const activeState = isLogin ? loginState : signupState;
  const activeAction = isLogin ? loginAction : signupAction;
  const isPending = isLogin ? isLoggingIn : isSigningUp;

  async function handleSocial(provider: "google" | "github") {
    setSocialLoading(provider);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isLogin ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Sign in to keep building your resume."
            : "Start building a resume that gets noticed."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <SocialButtons
          loadingProvider={socialLoading}
          onGoogleClick={() => handleSocial("google")}
          onGithubClick={() => handleSocial("github")}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400 dark:bg-slate-900">
              or continue with email
            </span>
          </div>
        </div>

        {/* 4. Form automatically routes to loginUser OR createNewUser! */}
        <form action={activeAction} className="space-y-4">
          {!isLogin && (
            <Input
              label="Full name"
              placeholder="Jane Doe"
              name="name"
              required
            />
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            required
          />

          {isLogin ? (
            <div className="flex items-center justify-between">
              <Checkbox label="Remember me" name="remember" />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-violet-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          ) : (
            <Checkbox
              required
              name="terms"
              label={
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-violet-600 hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-violet-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              }
            />
          )}

          {/* 5. Display backend success or error alerts */}
          {activeState?.message && (
            <p
              className={`text-sm ${activeState.messageType === "error" ? "text-red-600" : "text-green-600"}`}
            >
              {activeState.message}
            </p>
          )}

          {/* 6. Hook natively tracks submitting state via 'isPending' */}
          <Button type="submit" className="w-full" loading={isPending}>
            {isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          {/* CHANGE THESE TWO HREFS: */}
          <Link
            href={isLogin ? "/?mode=signup" : "/?mode=login"}
            className="font-medium text-violet-600 hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
