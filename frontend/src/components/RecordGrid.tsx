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

const formatMetaItem = (metaItem: RecordMetaItem) =>
  typeof metaItem === "string" ? metaItem : `${metaItem.label}: ${metaItem.value}`;

export const RecordGrid = ({ items, emptyMessage }: RecordGridProps) => {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="record-grid">
      {items.map((item) => {
        const metaItems = item.meta?.slice(0, 2) ?? [];

        return (
          <Link key={item.id} href={item.href as Route} className="record-card">
            <div className="record-card__body">
              <div className="record-card__top">
                <h3 className="record-card__title">{item.title}</h3>
                {item.status ? <StatusBadge label={item.status.label} tone={item.status.tone} /> : null}
              </div>
              {item.summary ? <p className="record-card__summary">{item.summary}</p> : null}
              {metaItems.length ? (
                <div className="record-card__meta">
                  {metaItems.map((metaItem, index) => (
                    <span
                      key={`${item.id}-meta-${formatMetaItem(metaItem)}-${index}`}
                      className="record-card__meta-chip"
                    >
                      {formatMetaItem(metaItem)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
