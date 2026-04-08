import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RecordManager } from "@/components/RecordManager";
import { adminResourceConfig, type AdminResourceKey } from "@/lib/admin-config";
import { fetchAdminReferences, serverApiFetch } from "@/lib/api-server";

const isAdminResource = (value: string): value is AdminResourceKey => value in adminResourceConfig;

export default async function AdminResourcePage({
  params
}: {
  params: Promise<{ resource: string }>;
}) {
  const resolvedParams = await params;

  if (!isAdminResource(resolvedParams.resource)) {
    notFound();
  }

  const config = adminResourceConfig[resolvedParams.resource];
  const [referenceData, data] = await Promise.all([
    fetchAdminReferences(),
    config.responseMode === "paginated"
      ? serverApiFetch<{ items: Record<string, unknown>[] }>(config.endpoint, undefined, { pageSize: 100 })
      : config.responseMode === "plain"
        ? serverApiFetch<{ items: Record<string, unknown>[] }>(config.endpoint)
        : serverApiFetch<{ item: Record<string, unknown> }>(config.endpoint)
  ]);

  const initialItems = "items" in data ? data.items : [data.item];

  return (
    <>
      <PageHeader eyebrow="Admin" title={config.title} description={config.description} />
      <RecordManager
        resource={resolvedParams.resource}
        initialItems={initialItems}
        referenceData={referenceData}
      />
    </>
  );
}
