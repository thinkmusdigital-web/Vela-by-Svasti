import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { ContentEditor, type ContentSection } from "@/components/admin/content-editor";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "content.manage")) redirect("/admin");

  const rows = await prisma.websiteContent.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
    select: { key: true, label: true, value: true, group: true, type: true },
  });

  const byGroup = new Map<string, ContentSection>();
  for (const row of rows) {
    const section = byGroup.get(row.group) ?? { group: row.group, items: [] };
    section.items.push({ key: row.key, label: row.label, value: row.value, type: row.type });
    byGroup.set(row.group, section);
  }

  const sections = [...byGroup.values()].map((section) => ({
    ...section,
    items: section.items.sort((a, b) => a.key.localeCompare(b.key)),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Website content"
        description="Heading, body and image values used across the public site. Changes go live immediately."
      />
      <ContentEditor sections={sections} />
    </>
  );
}