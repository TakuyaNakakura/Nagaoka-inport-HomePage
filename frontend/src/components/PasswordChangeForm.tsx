"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, clientApiFetch } from "@/lib/api-client";
import type { User } from "@/lib/types";

export const PasswordChangeForm = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setMessage(null);

    try {
      await clientApiFetch<{ user: User }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword })
      });

      setMessage("パスワードを更新しました。");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(submitError.message);
      } else {
        setError("パスワード変更に失敗しました。");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="form-intro">
        <h2>パスワード変更</h2>
        <p>初回ログイン時は仮パスワードから新しいパスワードへ変更してください。</p>
      </div>

      <label className="field">
        <span>現在のパスワード</span>
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>新しいパスワード</span>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          minLength={8}
          required
        />
      </label>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="primary-button" disabled={isPending}>
        {isPending ? "更新中..." : "変更する"}
      </button>
    </form>
  );
};
