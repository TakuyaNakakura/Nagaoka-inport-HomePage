"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

export const LogoutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await clientApiFetch("/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button type="button" className="ghost-button" onClick={handleLogout} disabled={isPending}>
      {isPending ? "ログアウト中..." : "ログアウト"}
    </button>
  );
};
