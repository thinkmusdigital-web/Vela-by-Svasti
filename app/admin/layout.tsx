import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Panel — Vela by Svasti",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}