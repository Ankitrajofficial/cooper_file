"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toErrorMessage } from "@/lib/utils";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLogin = mode === "login";
  const oauthError = searchParams.get("error");
  const visibleError = error || oauthError || "";
  const benefitBullets = [
    "Launch your first review funnel in minutes",
    "Generate premium AI review scripts instantly",
    "Share one clean page customers can actually use",
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Authentication failed.");
      }

      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    } catch (submissionError) {
      setError(toErrorMessage(submissionError));
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
      <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-[0_30px_70px_-35px_rgba(15,23,42,0.9)]">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_14px_30px_-16px_rgba(15,23,42,0.55)]">
            <Image
              src="/review-machine-logo.png"
              alt="Review Machine logo"
              width={56}
              height={56}
              className="h-14 w-14 object-cover"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-light">
              Review Machine
            </p>
            <p className="text-xs text-slate-300">
              AI Review Funnel
            </p>
          </div>
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.03em]">
          {isLogin ? "Welcome back" : "Start getting more reviews"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {isLogin
            ? "Sign in to manage premium review funnels for every client."
            : "Create your account and launch a polished AI-powered review system in minutes."}
        </p>
        <div className="mt-5 space-y-3">
          {benefitBullets.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                +
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="owner@business.com"
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 8 characters"
          required
        />

        {visibleError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {visibleError}
          </div>
        ) : null}

        <Button type="submit" fullWidth disabled={isPending}>
          {isPending
            ? isLogin
              ? "Signing in..."
              : "Creating account..."
            : isLogin
              ? "Login"
              : "Sign up"}
        </Button>
        <p className="text-center text-xs font-medium text-slate-500">
          Takes 30 seconds. No complicated setup.
        </p>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Link
        href="/api/auth/google"
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.3)] transition duration-200 hover:-translate-y-0.5 hover:from-white hover:to-white"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
          G
        </span>
        {isLogin ? "Continue with Google" : "Sign up with Google"}
      </Link>

      <p className="mt-6 text-sm text-slate-600">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-semibold text-brand transition hover:text-brand-dark"
        >
          {isLogin ? "Sign up" : "Login"}
        </Link>
      </p>
    </div>
  );
}
