"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApiFetch, ApiError } from "@/lib/api-client";
import type { User } from "@/lib/types";

export const LoginForm = () => {
  const router = useRouter();
  const [loginOrEmail, setLoginOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const response = await clientApiFetch<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ loginOrEmail, password })
      });

      router.push(response.user.mustChangePassword ? "/change-password" : "/");
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(submitError.message);
      } else {
        setError("ログインに失敗しました");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-card__head">
        <p className="eyebrow">Member Portal</p>
        <h1>ログイン</h1>
        <p>ログインIDまたはメールアドレスとパスワードを入力してください。</p>
      </div>

      <label className="field">
        <span>ログインID / メールアドレス</span>
        <input
          value={loginOrEmail}
          autoComplete="username"
          onChange={(event) => setLoginOrEmail(event.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>パスワード</span>
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="button-row">
        <button type="submit" className="primary-button" disabled={isPending}>
          {isPending ? "認証中..." : "ログイン"}
        </button>
      </div>

      <p className="muted-text">
        パスワード再設定は管理者による仮パスワード再発行で運用します。
      </p>
    </form>
  );
};
