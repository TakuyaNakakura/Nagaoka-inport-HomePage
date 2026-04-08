import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { fetchAbout } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function AboutPage() {
  const { item } = await fetchAbout();

  return (
    <>
      <PageHeader eyebrow="About" title={item.title} description="サイトの目的、位置づけ、利用規約" />
      <article className="panel detail-card">
        <ul className="detail-meta">
          <li>更新日: {formatDateTime(item.updatedAt)}</li>
        </ul>
        <section>
          <RichText value={item.body} />
        </section>
      </article>
    </>
  );
}

