import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Room details are managed by the deferred Prisma admin feature. Until a
// persistent database is configured, the database-backed catalogue is disabled.
export const metadata: Metadata = { title: "Rooms at Vela by Svasti, Raipur" };

export default function RoomDetailPage(): never {
  notFound();
}
