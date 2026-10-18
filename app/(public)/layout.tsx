import type { ReactNode } from "react";
import { connection } from "next/server";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HotelStructuredData } from "@/components/site/HotelStructuredData";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Public pages read admin-managed content from Prisma. Wait for a real
  // request so production builds do not query the deployment database.
  await connection();

  return (
    <>
      <HotelStructuredData />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
