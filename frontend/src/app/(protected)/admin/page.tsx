import Link from "next/link";
import type { Route } from "next";
import { PageHeader } from "@/components/PageHeader";
import { adminResourceEntries } from "@/lib/admin-config";

export default function AdminTopPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="管理トップ"
        description="記事、企業、技術シーズ、ユーザー、サイト情報をここから管理します。"
      />

      <div className="record-grid">
        {adminResourceEntries.map((resource) => (
          <Link key={resource.key} href={`/admin/${resource.key}` as Route} className="record-card">
            <div className="record-card__top">
              <h3>{resource.title}</h3>
            </div>
            <p>{resource.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
