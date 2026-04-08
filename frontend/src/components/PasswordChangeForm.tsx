"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, clientApiFetch } from "@/lib/api-client";
import type { User } from "@/lib/types";

const renderFieldLabel = (label: string, required?: boolean) => (
  <span className="field-label">
    <span>{label}</span>
    {required ? <span className="field-required">必須</span> : null}
  </span>
);

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

      <section className="form-section">
        <div className="form-section__head">
          <h3>認証情報</h3>
          <p>現在のパスワードを確認したうえで、新しいパスワードに更新します。</p>
        </div>
        <div className="form-section__body">
          <label className="field">
            {renderFieldLabel("現在のパスワード", true)}
            <input
              type="password"
              value={currentPassword}
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </label>

          <label className="field">
            {renderFieldLabel("新しいパスワード", true)}
            <input
              type="password"
              value={newPassword}
              autoComplete="new-password"
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
            />
            <small className="field-help">8文字以上で設定してください。</small>
          </label>
        </div>
      </section>

      {message ? (
        <p className="form-success" aria-live="polite">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={isPending}>
          {isPending ? "更新中..." : "変更する"}
        </button>
      </div>
    </form>
  );
};
