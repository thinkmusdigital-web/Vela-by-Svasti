import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { jsonError } from "@/lib/http";
import { parseEnquiryFilters, listEnquiries } from "@/lib/enquiry-query";
import { buildEnquiryWorkbook, serializeWorkbook, exportFileName } from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (!can(user, "enquiry.export")) return jsonError("Forbidden", 403);

  const url = new URL(request.url);
  const filters = parseEnquiryFilters(Object.fromEntries(url.searchParams.entries()));
  const scope = { all: can(user, "enquiry.viewAll"), userId: user.id };

  const { rows } = await listEnquiries(filters, scope, { takeAll: true });

  const workbook = buildEnquiryWorkbook(rows);
  const buffer = serializeWorkbook(workbook);

  const now = new Date();
  const fileParts = [
    "vela-by-svasti-enquiries",
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  ];
  if (filters.statuses.length) fileParts.push(`status-${filters.statuses[0].toLowerCase()}`);
  if (filters.q) fileParts.push("filtered");
  const filename = exportFileName(fileParts.join("_"));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}