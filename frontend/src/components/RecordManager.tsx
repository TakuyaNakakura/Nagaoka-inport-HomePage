"use client";

import { useState } from "react";
import { adminResourceConfig, type AdminResourceKey } from "@/lib/admin-config";
import { clientApiFetch, ApiError } from "@/lib/api-client";
import { type FormField, type FormValues } from "@/lib/forms";
import type { ReferenceData } from "@/lib/types";

const emptyValueForField = (field: FormField) => {
  if (field.type === "checkbox") {
    return false;
  }

  if (field.type === "multiselect") {
    return [] as string[];
  }

  return "";
};

const buildInitialValues = (fields: FormField[], item?: Record<string, unknown> | null): FormValues => {
  return fields.reduce<FormValues>((accumulator, field) => {
      const value = item?.[field.name];

      if (field.type === "checkbox") {
        accumulator[field.name] = Boolean(value);
        return accumulator;
      }

      if (field.type === "multiselect") {
        accumulator[field.name] = Array.isArray(value) ? (value as string[]) : [];
        return accumulator;
      }

      accumulator[field.name] = typeof value === "string" ? value : value == null ? "" : String(value);
      return accumulator;
    }, {});
};

const buildPayload = (fields: FormField[], values: FormValues) =>
  fields.reduce<Record<string, unknown>>((accumulator, field) => {
      const value = values[field.name];

      if (field.type === "checkbox") {
        accumulator[field.name] = Boolean(value);
        return accumulator;
      }

      if (field.type === "multiselect") {
        accumulator[field.name] = Array.isArray(value) ? value : [];
        return accumulator;
      }

      if (field.nullable && value === "") {
        accumulator[field.name] = null;
        return accumulator;
      }

      accumulator[field.name] = value;
      return accumulator;
    }, {});

type RecordManagerProps = {
  resource: AdminResourceKey;
  initialItems: Record<string, unknown>[];
  referenceData: ReferenceData;
};

export const RecordManager = ({ resource, initialItems, referenceData }: RecordManagerProps) => {
  const config = adminResourceConfig[resource];
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialItems[0]?.id ? String(initialItems[0].id) : null
  );
  const selectedItem =
    items.find((item) => String(item.id) === selectedId) ??
    (config.responseMode === "singleton" ? items[0] ?? null : null);
  const [formValues, setFormValues] = useState<FormValues>(buildInitialValues(config.fields, selectedItem));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const resetForItem = (item?: Record<string, unknown> | null) => {
    setFormValues(buildInitialValues(config.fields, item));
    setSelectedId((item?.id as string | undefined) ?? null);
  };

  const handleSelect = (item: Record<string, unknown>) => {
    resetForItem(item);
    setMessage(null);
    setError(null);
  };

  const handleCreateMode = () => {
    resetForItem(null);
    setMessage(null);
    setError(null);
  };

  const handleFieldChange = (field: FormField, value: string | boolean | string[]) => {
    setFormValues((current) => ({
      ...current,
      [field.name]: value
    }));
  };

  const syncItemState = (savedItem: Record<string, unknown>) => {
    setItems((current) => {
      const existingIndex = current.findIndex((item) => String(item.id) === String(savedItem.id));
      if (existingIndex === -1) {
        return [savedItem, ...current];
      }

      const next = [...current];
      next[existingIndex] = savedItem;
      return next;
    });
    resetForItem(savedItem);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setError(null);

    try {
      const payload = buildPayload(config.fields, formValues);
      const isUpdate = Boolean(selectedItem);
      const targetPath =
        config.responseMode === "singleton"
          ? config.endpoint
          : isUpdate
            ? `${config.endpoint}/${String(selectedItem?.id)}`
            : config.endpoint;

      const response = await clientApiFetch<{ item: Record<string, unknown>; tempPassword?: string }>(targetPath, {
        method: isUpdate || config.responseMode === "singleton" ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });

      syncItemState(response.item);
      setMessage(
        response.tempPassword
          ? `保存しました。仮パスワード: ${response.tempPassword}`
          : "保存しました。"
      );
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

    setIsPending(true);
    setMessage(null);
    setError(null);

    try {
      const targetPath = `${config.endpoint}/${String(selectedItem.id)}`;
      const response = await clientApiFetch<{ item?: Record<string, unknown> } | null>(targetPath, {
        method: "DELETE"
      });

      if (response && typeof response === "object" && "item" in response && response.item) {
        syncItemState(response.item);
        setMessage("更新しました。");
      } else {
        const remainingItems = items.filter((item) => String(item.id) !== String(selectedItem.id));
        setItems(remainingItems);
        resetForItem(remainingItems[0] ?? null);
        setMessage("削除しました。");
      }
    } catch (deleteError) {
      setError(deleteError instanceof ApiError ? deleteError.message : "削除に失敗しました。");
    } finally {
      setIsPending(false);
    }
  };

  const handleSecondaryAction = async () => {
    if (!selectedItem || !config.secondaryAction) {
      return;
    }

    setIsPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await clientApiFetch<{ item: Record<string, unknown>; tempPassword?: string }>(
        `${config.endpoint}/${String(selectedItem.id)}${config.secondaryAction.pathSuffix}`,
        { method: "POST" }
      );

      syncItemState(response.item);
      setMessage(
        response.tempPassword
          ? `仮パスワードを再発行しました: ${response.tempPassword}`
          : "処理が完了しました。"
      );
    } catch (actionError) {
      setError(actionError instanceof ApiError ? actionError.message : "処理に失敗しました。");
    } finally {
      setIsPending(false);
    }
  };

  const selectedOptions = (field: FormField) => {
    if (field.options) {
      return field.options;
    }

    if (field.optionsKey) {
      return referenceData[field.optionsKey].map((option) => ({
        label: option.label,
        value: option.id
      }));
    }

    return [];
  };

  return (
    <div className="manager-layout">
      <aside className="panel manager-list">
        <div className="manager-list__head">
          <div>
            <h2>一覧</h2>
            <p>{config.description}</p>
          </div>
          {config.allowCreate ? (
            <button type="button" className="secondary-button" onClick={handleCreateMode}>
              新規作成
            </button>
          ) : null}
        </div>

        <div className="manager-items">
          {items.length === 0 ? <p className="empty-state">登録データがありません。</p> : null}
          {items.map((item) => (
            <button
              key={String(item.id)}
              type="button"
              className={`manager-item ${String(item.id) === String(selectedItem?.id) ? "active" : ""}`}
              onClick={() => handleSelect(item)}
            >
              <strong>{String(item[config.listTitleField] ?? "名称未設定")}</strong>
              {config.listSummaryField ? (
                <span>{String(item[config.listSummaryField] ?? "")}</span>
              ) : null}
            </button>
          ))}
        </div>
      </aside>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="manager-form__head">
          <div>
            <h2>{selectedItem ? "編集" : "新規作成"}</h2>
            <p>{selectedItem ? "選択中のデータを更新します。" : "新しいデータを作成します。"}</p>
          </div>
          <div className="button-row">
            {config.secondaryAction && selectedItem ? (
              <button type="button" className="secondary-button" onClick={handleSecondaryAction}>
                {config.secondaryAction.label}
              </button>
            ) : null}
            {config.allowDelete && selectedItem ? (
              <button type="button" className="danger-button" onClick={handleDelete}>
                {config.deleteLabel ?? "削除"}
              </button>
            ) : null}
          </div>
        </div>

        {config.fields.map((field) => {
          const value = formValues[field.name] ?? emptyValueForField(field);
          const options = selectedOptions(field);

          if (field.type === "textarea") {
            return (
              <label key={field.name} className="field">
                <span>{field.label}</span>
                <textarea
                  rows={field.rows ?? 5}
                  value={String(value)}
                  placeholder={field.placeholder}
                  onChange={(event) => handleFieldChange(field, event.target.value)}
                  required={field.required}
                />
                {field.helpText ? <small>{field.helpText}</small> : null}
              </label>
            );
          }

          if (field.type === "select") {
            return (
              <label key={field.name} className="field">
                <span>{field.label}</span>
                <select
                  value={String(value)}
                  onChange={(event) => handleFieldChange(field, event.target.value)}
                  required={field.required}
                >
                  <option value="">未選択</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {field.helpText ? <small>{field.helpText}</small> : null}
              </label>
            );
          }

          if (field.type === "checkbox") {
            return (
              <label key={field.name} className="checkbox-field">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => handleFieldChange(field, event.target.checked)}
                />
                <span>{field.label}</span>
              </label>
            );
          }

          if (field.type === "multiselect") {
            const selectedValues = Array.isArray(value) ? value : [];

            return (
              <fieldset key={field.name} className="fieldset">
                <legend>{field.label}</legend>
                <div className="checkbox-grid">
                  {options.map((option) => (
                    <label key={option.value} className="checkbox-chip">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option.value)}
                        onChange={(event) =>
                          handleFieldChange(
                            field,
                            event.target.checked
                              ? [...selectedValues, option.value]
                              : selectedValues.filter((selectedValue) => selectedValue !== option.value)
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          }

          return (
            <label key={field.name} className="field">
              <span>{field.label}</span>
              <input
                value={String(value)}
                placeholder={field.placeholder}
                onChange={(event) => handleFieldChange(field, event.target.value)}
                required={field.required}
              />
              {field.helpText ? <small>{field.helpText}</small> : null}
            </label>
          );
        })}

        {message ? <p className="form-success">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={isPending}>
            {isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
};
