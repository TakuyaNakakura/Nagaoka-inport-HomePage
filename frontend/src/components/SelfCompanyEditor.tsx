"use client";

import { FormEvent, useState } from "react";
import { ApiError, clientApiFetch } from "@/lib/api-client";
import type { Company } from "@/lib/types";

type SelfCompanyEditorProps = {
  company: Company;
};

const renderFieldLabel = (label: string, required?: boolean) => (
  <span className="field-label">
    <span>{label}</span>
    {required ? <span className="field-required">必須</span> : null}
  </span>
);

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

      <section className="form-section">
        <div className="form-section__head">
          <h3>基本情報</h3>
          <p>企業名、業種、所在地、連絡先など、一覧でも参照される情報です。</p>
        </div>
        <div className="form-section__body field-grid field-grid--compact">
          <label className="field">
            {renderFieldLabel("企業名", true)}
            <input
              value={formValues.companyName}
              onChange={(event) => setFormValues((current) => ({ ...current, companyName: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            {renderFieldLabel("業種", true)}
            <input
              value={formValues.industry}
              onChange={(event) => setFormValues((current) => ({ ...current, industry: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            {renderFieldLabel("所在地")}
            <input
              value={formValues.address}
              onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
            />
          </label>
          <label className="field">
            {renderFieldLabel("連絡先")}
            <input
              value={formValues.contactInfo}
              onChange={(event) => setFormValues((current) => ({ ...current, contactInfo: event.target.value }))}
            />
            <small className="field-help">メールアドレスや電話番号など、公開してよい連絡先を入力します。</small>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section__head">
          <h3>公開プロフィール</h3>
          <p>一覧や詳細画面で読まれる説明を、項目ごとに整理して入力します。</p>
        </div>
        <div className="form-section__body">
          <label className="field">
            {renderFieldLabel("事業概要")}
            <textarea
              rows={6}
              value={formValues.businessSummary}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, businessSummary: event.target.value }))
              }
            />
            <small className="field-help">会社の事業内容や得意分野が伝わるよう、簡潔に整理して記載します。</small>
          </label>
          <label className="field">
            {renderFieldLabel("高専との関心テーマ")}
            <textarea
              rows={5}
              value={formValues.interestTheme}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, interestTheme: event.target.value }))
              }
            />
            <small className="field-help">相談したいテーマや、連携を検討している分野があれば記載します。</small>
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
          {isPending ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
};
