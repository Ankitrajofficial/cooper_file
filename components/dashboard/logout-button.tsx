"use client";

import type { Route } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton({ redirectTo = "/login" }: { redirectTo?: Route }) {
  const [isPending, setIsPending] = useState(false);

  function handleLogout() {
    setIsPending(true);

    (async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Sign out failed.");
        }

        window.location.assign(redirectTo);
      } catch {
        setIsPending(false);
      }
    })();
  }

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={isPending}>
      {isPending ? "Signing out..." : "Logout"}
    </Button>
  );
}
