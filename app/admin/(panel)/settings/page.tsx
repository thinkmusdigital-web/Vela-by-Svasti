import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const CONTACT_KEYS: { key: string; label: string; group: string }[] = [
  { key: "contact.phone", label: "Front desk phone", group: "contact" },
  { key: "contact.whatsapp", label: "WhatsApp number", group: "contact" },
  { key: "contact.email", label: "Reservations email", group: "contact" },
  { key: "contact.address", label: "Address line", group: "contact" },
  { key: "contact.mapEmbedUrl", label: "Map embed URL", group: "contact" },
  { key: "contact.directionsUrl", label: "Directions URL", group: "contact" },
  { key: "social.instagram", label: "Instagram URL", group: "contact" },
  { key: "social.facebook", label: "Facebook URL", group: "contact" },
  { key: "social.youtube", label: "YouTube URL", group: "contact" },
  { key: "social.linkedin", label: "LinkedIn URL", group: "contact" },
];

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "settings.manage")) redirect("/admin");

  const [contentRows, systemRows] = await Promise.all([
    prisma.websiteContent.findMany({
      where: { key: { in: CONTACT_KEYS.map((k) => k.key) } },
      select: { key: true, value: true },
    }),
    prisma.setting.findMany({
      orderBy: { key: "asc" },
      select: { key: true, label: true, value: true, type: true },
    }),
  ]);

  const contentMap = Object.fromEntries(contentRows.map((row) => [row.key, row.value]));
  const contact = CONTACT_KEYS.map((item) => ({
    ...item,
    value: contentMap[item.key] ?? "",
  }));

  const system = systemRows.map((row) => ({
    key: row.key,
    label: row.label || row.key,
    value: row.value,
    type: row.type,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Hotel contact numbers, social links and operational values. Contact details also live on the Content page."
      />
      <SettingsEditor contact={contact} system={system} />
    </>
  );
}