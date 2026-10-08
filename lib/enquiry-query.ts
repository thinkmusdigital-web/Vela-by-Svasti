import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ENQUIRY_STATUSES, OPEN_STATUSES } from "@/lib/constants";

export interface EnquiryFilters {
  q?: string;
  statuses: string[];
  callStatuses: string[];
  assignedStaffId?: string; // user id, "unassigned", or undefined = all
  roomTypeId?: string;
  source?: string;
  enquiryType?: string;
  createdFrom?: Date;
  createdTo?: Date;
  checkInFrom?: Date;
  checkInTo?: Date;
  followUpFrom?: Date;
  followUpTo?: Date;
  overdueOnly: boolean;
  sort: string;
  order: "asc" | "desc";
  page: number;
  pageSize: number;
}

type Params = Record<string, string | string[] | undefined>;

function one(params: Params, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseDay(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  if (date.toISOString().slice(0, 10) !== value) return undefined;
  return date;
}

function parseList(value: string | undefined, allowed: readonly string[]): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => allowed.includes(v));
}

export function parseEnquiryFilters(params: Params): EnquiryFilters {
  const createdTo = parseDay(one(params, "createdTo"));
  const checkInTo = parseDay(one(params, "checkInTo"));
  const followUpTo = parseDay(one(params, "followUpTo"));

  const sortRaw = one(params, "sort") ?? "created";
  const allowedSorts = ["created", "followUp", "checkIn", "status", "name", "enquiryId"];
  const sort = allowedSorts.includes(sortRaw) ? sortRaw : "created";
  const order = one(params, "order") === "asc" ? "asc" : "desc";

  const page = Math.max(1, Number(one(params, "page")) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(one(params, "pageSize")) || 20));

  return {
    q: one(params, "q")?.trim() || undefined,
    statuses: parseList(one(params, "status"), ENQUIRY_STATUSES),
    callStatuses: parseList(one(params, "callStatus"), ["PENDING_CALL", "CALLED", "NO_ANSWER", "CALL_BACK_REQUESTED", "NOT_INTERESTED"]),
    assignedStaffId: one(params, "assigned") || undefined,
    roomTypeId: one(params, "roomType") || undefined,
    source: one(params, "source") || undefined,
    enquiryType: one(params, "type") || undefined,
    createdFrom: parseDay(one(params, "createdFrom")),
    createdTo,
    checkInFrom: parseDay(one(params, "checkInFrom")),
    checkInTo,
    followUpFrom: parseDay(one(params, "followUpFrom")),
    followUpTo,
    overdueOnly: one(params, "overdue") === "1",
    sort,
    order,
    page,
    pageSize,
  };
}

const SORT_FIELDS: Record<string, Prisma.EnquiryOrderByWithRelationInput> = {
  created: { createdAt: "desc" },
  followUp: { followUpDate: "asc" },
  checkIn: { checkInDate: "asc" },
  status: { finalStatus: "asc" },
  name: { customerName: "asc" },
  enquiryId: { enquiryId: "desc" },
};

export interface VisibilityScope {
  /** true → every enquiry; false → only enquiries assigned to `userId` */
  all: boolean;
  userId: string;
}

export function buildEnquiryWhere(
  filters: EnquiryFilters,
  scope: VisibilityScope,
): Prisma.EnquiryWhereInput {
  const where: Prisma.EnquiryWhereInput = { deletedAt: null };

  if (!scope.all) where.assignedStaffId = scope.userId;

  if (filters.q) {
    where.OR = [
      { enquiryId: { contains: filters.q } },
      { customerName: { contains: filters.q } },
      { mobileNumber: { contains: filters.q.replace(/\D/g, "") || filters.q } },
      { email: { contains: filters.q } },
    ];
  }
  if (filters.statuses.length) where.finalStatus = { in: filters.statuses };
  if (filters.callStatuses.length) where.callStatus = { in: filters.callStatuses };
  if (filters.roomTypeId) where.roomTypeId = filters.roomTypeId;
  if (filters.source) where.source = filters.source;
  if (filters.enquiryType) where.enquiryType = filters.enquiryType;

  if (filters.assignedStaffId === "unassigned") {
    where.assignedStaffId = null;
  } else if (filters.assignedStaffId && scope.all) {
    where.assignedStaffId = filters.assignedStaffId;
  }

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {
      ...(filters.createdFrom ? { gte: filters.createdFrom } : {}),
      ...(filters.createdTo ? { lt: new Date(filters.createdTo.getTime() + 86_400_000) } : {}),
    };
  }
  if (filters.checkInFrom || filters.checkInTo) {
    where.checkInDate = {
      ...(filters.checkInFrom ? { gte: filters.checkInFrom } : {}),
      ...(filters.checkInTo ? { lte: filters.checkInTo } : {}),
    };
  }
  if (filters.followUpFrom || filters.followUpTo) {
    where.followUpDate = {
      ...(filters.followUpFrom ? { gte: filters.followUpFrom } : {}),
      ...(filters.followUpTo ? { lte: filters.followUpTo } : {}),
    };
  }
  if (filters.overdueOnly) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    where.followUpDate = { ...(where.followUpDate as object), lte: endOfToday };
    where.finalStatus = { in: OPEN_STATUSES };
  }

  return where;
}

export function buildOrderBy(filters: EnquiryFilters): Prisma.EnquiryOrderByWithRelationInput {
  const base = SORT_FIELDS[filters.sort] ?? SORT_FIELDS.created;
  const [field, direction] = Object.entries(base)[0] as [
    keyof Prisma.EnquiryOrderByWithRelationInput,
    Prisma.SortOrder,
  ];
  return { [field]: filters.order === "asc" ? direction : filters.order } as Prisma.EnquiryOrderByWithRelationInput;
}

export async function listEnquiries(
  filters: EnquiryFilters,
  scope: VisibilityScope,
  options?: { takeAll?: boolean },
) {
  const where = buildEnquiryWhere(filters, scope);
  const orderBy = buildOrderBy(filters);
  const [rows, total] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      orderBy,
      skip: options?.takeAll ? undefined : (filters.page - 1) * filters.pageSize,
      take: options?.takeAll ? undefined : filters.pageSize,
      include: {
        roomType: { select: { name: true } },
        assignedStaff: { select: { name: true } },
      },
    }),
    prisma.enquiry.count({ where }),
  ]);

  return {
    rows,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function getDashboardSummary(scope: VisibilityScope) {
  const base: Prisma.EnquiryWhereInput = scope.all
    ? { deletedAt: null }
    : { deletedAt: null, assignedStaffId: scope.userId };

  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [total, byStatus, today, dueFollowUps, bySource, byRoomType, byStaff, recent] =
    await Promise.all([
      prisma.enquiry.count({ where: base }),
      prisma.enquiry.groupBy({
        by: ["finalStatus"],
        where: base,
        _count: { _all: true },
      }),
      prisma.enquiry.count({ where: { ...base, createdAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.enquiry.findMany({
        where: {
          ...base,
          followUpDate: { lte: todayEnd },
          finalStatus: { in: OPEN_STATUSES },
        },
        orderBy: { followUpDate: "asc" },
        take: 25,
        select: {
          id: true,
          enquiryId: true,
          customerName: true,
          mobileNumber: true,
          purposeOfStay: true,
          followUpDate: true,
          finalStatus: true,
          assignedStaff: { select: { name: true } },
        },
      }),
      prisma.enquiry.groupBy({ by: ["source"], where: base, _count: { _all: true } }),
      prisma.enquiry.groupBy({
        by: ["roomTypeId"],
        where: { ...base, roomTypeId: { not: null } },
        _count: { _all: true },
      }),
      prisma.enquiry.groupBy({
        by: ["assignedStaffId"],
        where: { ...base, assignedStaffId: { not: null } },
        _count: { _all: true },
      }),
      prisma.enquiry.findMany({
        where: { ...base, createdAt: { gte: new Date(Date.now() - 14 * 86_400_000) } },
        select: { createdAt: true, finalStatus: true },
      }),
    ]);

  const statusCounts = Object.fromEntries(
    ENQUIRY_STATUSES.map((status) => [
      status,
      byStatus.find((row) => row.finalStatus === status)?._count._all ?? 0,
    ]),
  );

  const converted = statusCounts.CONVERTED;
  const staffIds = byStaff.map((row) => row.assignedStaffId as string);
  const staffRows = staffIds.length
    ? await prisma.user.findMany({ where: { id: { in: staffIds } }, select: { id: true, name: true } })
    : [];
  const roomTypeIds = byRoomType
    .map((row) => row.roomTypeId as string)
    .filter(Boolean);
  const roomTypeRows = roomTypeIds.length
    ? await prisma.roomType.findMany({
        where: { id: { in: roomTypeIds } },
        select: { id: true, name: true },
      })
    : [];

  // 14-day trend bucketed by day
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day.getTime() + 86_400_000);
    const count = recent.filter(
      (row) => row.createdAt >= day && row.createdAt < next,
    ).length;
    days.push({ date: day.toISOString().slice(0, 10), count });
  }

  const overdue = dueFollowUps.filter((row) => (row.followUpDate as Date) < todayStart).length;
  const dueToday = dueFollowUps.length - overdue;

  return {
    total,
    statusCounts,
    today,
    dueFollowUps,
    dueToday,
    overdue,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    bySource: bySource.map((row) => ({
      label: row.source,
      count: row._count._all,
    })),
    byRoomType: byRoomType.map((row) => ({
      label: roomTypeRows.find((rt) => rt.id === row.roomTypeId)?.name ?? "Unspecified",
      count: row._count._all,
    })),
    byStaff: byStaff.map((row) => ({
      label: staffRows.find((u) => u.id === row.assignedStaffId)?.name ?? "Unassigned",
      count: row._count._all,
    })),
    trend: days,
  };
}
