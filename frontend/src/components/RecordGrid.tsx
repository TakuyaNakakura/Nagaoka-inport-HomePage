import Link from "next/link";
import type { Route } from "next";
import { StatusBadge } from "./StatusBadge";

type RecordCard = {
  id: string;
  href: string;
  title: string;
  summary?: string | null;
  meta?: string[];
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
          <div className="record-card__top">
            <h3>{item.title}</h3>
            {item.status ? <StatusBadge label={item.status.label} tone={item.status.tone} /> : null}
          </div>
          {item.summary ? <p>{item.summary}</p> : null}
          {item.meta?.length ? (
            <ul className="meta-list">
              {item.meta.map((metaItem) => (
                <li key={metaItem}>{metaItem}</li>
              ))}
            </ul>
          ) : null}
        </Link>
      ))}
    </div>
  );
};
