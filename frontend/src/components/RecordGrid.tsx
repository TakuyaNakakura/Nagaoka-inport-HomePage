import Link from "next/link";
import type { Route } from "next";
import { StatusBadge } from "./StatusBadge";

type RecordMetaItem =
  | string
  | {
      label: string;
      value: string;
    };

type RecordCard = {
  id: string;
  href: string;
  title: string;
  summary?: string | null;
  meta?: RecordMetaItem[];
  status?: {
    label: string;
    tone?: "neutral" | "success" | "warning";
  };
};

type RecordGridProps = {
  items: RecordCard[];
  emptyMessage: string;
};

export const RecordGrid = ({ items, emptyMessage }: RecordGridProps) => {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="record-grid">
      {items.map((item) => (
        <Link key={item.id} href={item.href as Route} className="record-card">
          <div className="record-card__body">
            <div className="record-card__top">
              <h3>{item.title}</h3>
              {item.status ? <StatusBadge label={item.status.label} tone={item.status.tone} /> : null}
            </div>
            {item.summary ? <p className="record-card__summary">{item.summary}</p> : null}
            {item.meta?.length ? (
              <div className="record-card__meta">
                {item.meta.map((metaItem, index) =>
                  typeof metaItem === "string" ? (
                    <span key={`${item.id}-meta-${index}`} className="record-card__meta-chip">
                      {metaItem}
                    </span>
                  ) : (
                    <div
                      key={`${item.id}-meta-${metaItem.label}-${metaItem.value}-${index}`}
                      className="record-card__meta-pair"
                    >
                      <span className="record-card__meta-label">{metaItem.label}</span>
                      <strong className="record-card__meta-value">{metaItem.value}</strong>
                    </div>
                  )
                )}
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
};
