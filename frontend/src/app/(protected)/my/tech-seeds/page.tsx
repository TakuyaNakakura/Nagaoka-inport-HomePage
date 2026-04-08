import { PageHeader } from "@/components/PageHeader";
import { SelfTechSeedManager } from "@/components/SelfTechSeedManager";
import { serverApiFetch } from "@/lib/api-server";
import type { TechSeed } from "@/lib/types";

export default async function MyTechSeedsPage() {
  const response = await serverApiFetch<{ items: TechSeed[] }>("/me/tech-seeds");

  return (
    <>
      <PageHeader
        eyebrow="My Tech Seeds"
        title="自社技術シーズ管理"
        description="自社に紐づく技術シーズを複数登録・編集できます。"
      />
      <SelfTechSeedManager initialItems={response.items} />
    </>
  );
}

