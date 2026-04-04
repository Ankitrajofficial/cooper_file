"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveSafePostAuthRedirect } from "@/lib/auth-redirect";
import { toErrorMessage } from "@/lib/utils";

type AuthFormProps = {
  mode: "login" | "signup";
  audience?: "client" | "admin";
};

export function AuthForm({ mode, audience = "client" }: AuthFormProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";
  const isAdmin = audience === "admin";
  const oauthError = searchParams.get("error");
  const visibleError = error || oauthError || "";
  const benefitBullets = isAdmin
    ? [
        "Manage client plans and manual access",
        "Track review clicks and portfolio activity",
        "Control subscriptions and client links centrally",
      ]
    : [
        "Launch your first Google review funnel in minutes",
        "Create curated reviews that support local SEO",
        "Share one-click review pages customers can actually use",
      ];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    (async () => {
      try {
        const response = await fetch(`/api/auth/${mode}`, {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          redirectTo?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Authentication failed.");
        }

        const role = isAdmin ? "admin" : "client";
        const targetPath =
          mode === "login"
            ? resolveSafePostAuthRedirect(
                searchParams.get("next"),
                role,
                payload.redirectTo,
              )
            : resolveSafePostAuthRedirect(payload.redirectTo, role);

        window.location.assign(targetPath as Route);
      } catch (submissionError) {
        setError(toErrorMessage(submissionError));
        setIsSubmitting(false);
      }
    })();
  }

  return (
    <div className="w-full max-w-md">
      {/* Top branded card */}
      <div className="hero-gradient relative overflow-hidden rounded-t-2xl border border-white/[0.06] p-6 text-white">
        <div className="absolute inset-0 premium-grid opacity-20" />
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand/10 blur-[60px]" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950 shadow-lg">
              <Image
                src="/review-machine-logo.png"
                alt={`${isAdmin ? "Admin" : "Client"} logo`}
                width={48}
                height={48}
                className="h-11 w-11 object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">
                {isAdmin ? "Review Engine Admin" : "Review Engine"}
              </p>
              <p className="text-[11px] text-slate-400">
                {isAdmin ? "Control panel" : "Client workspace"}
              </p>
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
            {isAdmin
              ? "Admin access"
              : isLogin
                ? "Welcome back"
                : "Start getting more reviews"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {isAdmin
              ? "Sign in to manage client subscriptions, links, and performance from one control panel."
              : isLogin
                ? "Sign in to manage your review engine workspace."
                : "Create your account, choose a plan, and start building review links."}
          </p>
          <div className="mt-4 space-y-2">
            {benefitBullets.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <svg
                  className="h-4 w-4 shrink-0 text-brand-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-b-2xl border border-t-0 border-slate-200/80 bg-white p-6 shadow-panel-lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
                ? "Login"
                : "Sign up"}
          </Button>
          <p className="text-center text-xs text-slate-500">
            Takes 30 seconds · No complicated setup
          </p>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            or
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {!isAdmin ? (
          <Link
            href="/api/auth/google"
            className="card-hover inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-card transition-all duration-200 hover:shadow-card-hover"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLogin ? "Continue with Google" : "Sign up with Google"}
          </Link>
        ) : null}

        {!isAdmin ? (
          <div className="mt-5 space-y-2 text-center text-sm text-slate-600">
            <p>
              {isLogin ? "Need an account?" : "Already have an account?"}{" "}
              <Link
                href={isLogin ? "/signup" : "/login"}
                className="font-semibold text-brand transition hover:text-brand-dark"
              >
                {isLogin ? "Sign up" : "Login"}
              </Link>
            </p>
            {isLogin ? (
              <p className="text-xs text-slate-500">
                Need admin access?{" "}
                <Link href="/admin/login" className="font-semibold text-brand transition hover:text-brand-dark">
                  Admin login
                </Link>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-center text-sm text-slate-600">
            Need the client workspace?{" "}
            <Link href="/login" className="font-semibold text-brand transition hover:text-brand-dark">
              Client login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
