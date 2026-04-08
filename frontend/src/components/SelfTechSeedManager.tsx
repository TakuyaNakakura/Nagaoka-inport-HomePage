"use client";

import { useState } from "react";
import { ApiError, clientApiFetch } from "@/lib/api-client";
import type { TechSeed } from "@/lib/types";

const emptyForm = {
  seedName: "",
  seedSummary: "",
  applicationField: "",
  usageExample: "",
  strength: "",
  relatedResults: "",
  collaborationTheme: ""
};

const buildFormValues = (item: TechSeed | null) => ({
  seedName: item?.seedName ?? "",
  seedSummary: item?.seedSummary ?? "",
  applicationField: item?.applicationField ?? "",
  usageExample: item?.usageExample ?? "",
  strength: item?.strength ?? "",
  relatedResults: item?.relatedResults ?? "",
  collaborationTheme: item?.collaborationTheme ?? ""
});

const renderFieldLabel = (label: string, required?: boolean) => (
  <span className="field-label">
    <span>{label}</span>
    {required ? <span className="field-required">必須</span> : null}
  </span>
);

type SelfTechSeedManagerProps = {
  initialItems: TechSeed[];
};

export const SelfTechSeedManager = ({ initialItems }: SelfTechSeedManagerProps) => {
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(initialItems[0]?.id ?? null);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;
  const [formValues, setFormValues] = useState(buildFormValues(selectedItem));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const syncForm = (nextItem: TechSeed | null) => {
    setSelectedId(nextItem?.id ?? null);
    setFormValues(nextItem ? buildFormValues(nextItem) : emptyForm);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    try {
      const payload = {
        ...formValues,
        applicationField: formValues.applicationField || null,
        usageExample: formValues.usageExample || null,
        strength: formValues.strength || null,
        relatedResults: formValues.relatedResults || null,
        collaborationTheme: formValues.collaborationTheme || null
      };

      const response = await clientApiFetch<{ item: TechSeed }>(
        selectedItem ? `/me/tech-seeds/${selectedItem.id}` : "/me/tech-seeds",
        {
          method: selectedItem ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setItems((current) => {
        const index = current.findIndex((item) => item.id === response.item.id);
        if (index === -1) {
          return [response.item, ...current];
        }

        const next = [...current];
        next[index] = response.item;
        return next;
      });
      syncForm(response.item);
      setMessage("技術シーズを保存しました。");
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "保存に失敗しました。");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsPending(true);

    try {
      await clientApiFetch(`/me/tech-seeds/${selectedItem.id}`, { method: "DELETE" });
      const nextItems = items.filter((item) => item.id !== selectedItem.id);
      setItems(nextItems);
      syncForm(nextItems[0] ?? null);
      setMessage("技術シーズを削除しました。");
    } catch (deleteError) {
      setError(deleteError instanceof ApiError ? deleteError.message : "削除に失敗しました。");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="manager-layout">
      <aside className="panel manager-list">
        <div className="manager-list__head">
          <div>
            <h2>登録済み技術シーズ</h2>
            <p>複数登録できます。編集したい項目を選択してください。</p>
          </div>
          <button type="button" className="secondary-button" onClick={() => syncForm(null)}>
            新規作成
          </button>
        </div>

        <div className="manager-items">
          {items.length === 0 ? (
            <div className="empty-state">
              <strong>まだ技術シーズがありません。</strong>
              <span>「新規作成」から登録するとここに一覧表示されます。</span>
            </div>
          ) : null}
          {items.map((item) => {
            const isActive = selectedItem?.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`manager-item ${isActive ? "active" : ""}`}
                aria-pressed={isActive}
                onClick={() => syncForm(item)}
              >
                <div className="manager-item__top">
                  <strong className="manager-item__title">{item.seedName}</strong>
                  {isActive ? <span className="manager-item__badge">編集中</span> : null}
                </div>
                <span className="manager-item__summary">{item.applicationField ?? "分野未設定"}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="manager-form__head">
          <div>
            <h2>{selectedItem ? "技術シーズ編集" : "技術シーズ登録"}</h2>
            <p>会員企業の強みや連携可能テーマを、読み比べしやすい形で整理します。</p>
          </div>
          {selectedItem ? (
            <button type="button" className="danger-button" onClick={handleDelete}>
              削除
            </button>
          ) : null}
        </div>

        <section className="form-section">
          <div className="form-section__head">
            <h3>基本情報</h3>
            <p>一覧で見分けやすい技術名と対応分野です。</p>
          </div>
          <div className="form-section__body field-grid field-grid--compact">
            <label className="field">
              {renderFieldLabel("技術シーズ名", true)}
              <input
                value={formValues.seedName}
                onChange={(event) => setFormValues((current) => ({ ...current, seedName: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              {renderFieldLabel("対応可能分野")}
              <input
                value={formValues.applicationField}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, applicationField: event.target.value }))
                }
              />
              <small className="field-help">例: IoT、機械加工、材料評価 など</small>
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section__head">
            <h3>技術内容</h3>
            <p>何ができるか、どこに強みがあるかを項目ごとに整理します。</p>
          </div>
          <div className="form-section__body">
            <label className="field">
              {renderFieldLabel("技術概要", true)}
              <textarea
                rows={5}
                value={formValues.seedSummary}
                onChange={(event) => setFormValues((current) => ({ ...current, seedSummary: event.target.value }))}
                required
              />
              <small className="field-help">まず全体像が伝わる要約を記載します。</small>
            </label>
            <label className="field">
              {renderFieldLabel("活用用途")}
              <textarea
                rows={4}
                value={formValues.usageExample}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, usageExample: event.target.value }))
                }
              />
            </label>
            <label className="field">
              {renderFieldLabel("強み・特徴")}
              <textarea
                rows={4}
                value={formValues.strength}
                onChange={(event) => setFormValues((current) => ({ ...current, strength: event.target.value }))}
              />
            </label>
            <label className="field">
              {renderFieldLabel("関連製品・実績")}
              <textarea
                rows={4}
                value={formValues.relatedResults}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, relatedResults: event.target.value }))
                }
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section__head">
            <h3>連携情報</h3>
            <p>高専や他企業と連携したいテーマを、検討しやすい形で示します。</p>
          </div>
          <div className="form-section__body">
            <label className="field">
              {renderFieldLabel("連携したいテーマ")}
              <textarea
                rows={4}
                value={formValues.collaborationTheme}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, collaborationTheme: event.target.value }))
                }
              />
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
    </div>
  );
};
