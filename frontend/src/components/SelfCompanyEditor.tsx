"use client";

import { FormEvent, useState } from "react";
import { ApiError, clientApiFetch } from "@/lib/api-client";
import type { Company } from "@/lib/types";

type SelfCompanyEditorProps = {
  company: Company;
};

export const SelfCompanyEditor = ({ company }: SelfCompanyEditorProps) => {
  const [formValues, setFormValues] = useState({
    companyName: company.companyName,
    industry: company.industry,
    address: company.address ?? "",
    businessSummary: company.businessSummary ?? "",
    interestTheme: company.interestTheme ?? "",
    contactInfo: company.contactInfo ?? ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsPending(true);

    try {
      await clientApiFetch("/me/company", {
        method: "PATCH",
        body: JSON.stringify({
          ...formValues,
          address: formValues.address || null,
          businessSummary: formValues.businessSummary || null,
          interestTheme: formValues.interestTheme || null,
          contactInfo: formValues.contactInfo || null
        })
      });

      setMessage("会社情報を更新しました。");
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "保存に失敗しました。");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="form-intro">
        <h2>自社会社情報の編集</h2>
        <p>公開されている自社プロフィールを更新します。保存後は一覧・詳細にも反映されます。</p>
      </div>

      <label className="field">
        <span>企業名</span>
        <input
          value={formValues.companyName}
          onChange={(event) => setFormValues((current) => ({ ...current, companyName: event.target.value }))}
          required
        />
      </label>
      <label className="field">
        <span>業種</span>
        <input
          value={formValues.industry}
          onChange={(event) => setFormValues((current) => ({ ...current, industry: event.target.value }))}
          required
        />
      </label>
      <label className="field">
        <span>所在地</span>
        <input
          value={formValues.address}
          onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
        />
      </label>
      <label className="field">
        <span>連絡先</span>
        <input
          value={formValues.contactInfo}
          onChange={(event) => setFormValues((current) => ({ ...current, contactInfo: event.target.value }))}
        />
      </label>
      <label className="field">
        <span>事業概要</span>
        <textarea
          rows={6}
          value={formValues.businessSummary}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, businessSummary: event.target.value }))
          }
        />
      </label>
      <label className="field">
        <span>高専との関心テーマ</span>
        <textarea
          rows={5}
          value={formValues.interestTheme}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, interestTheme: event.target.value }))
          }
        />
      </label>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="primary-button" disabled={isPending}>
        {isPending ? "保存中..." : "保存する"}
      </button>
    </form>
  );
};

