"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
      } catch {
        /* keep button enabled on failure */
      }
    });
  }

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={isPending}>
      {isPending ? "Signing out..." : "Logout"}
    </Button>
  );
}
