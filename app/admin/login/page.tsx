import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/Logo";

export const metadata = { title: "Staff login — Vela by Svasti" };

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/admin") ? params.next : undefined;
  const user = await getCurrentUser();
  if (user) redirect(next ?? "/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center">
          <Logo variant="dark" layout="full" height={72} priority className="mx-auto" />
        </Link>
        <div className="mt-8 border border-line bg-white p-8">
          <p className="label-field">Sign in</p>
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-[0.8rem] text-fog">
          This area is for hotel staff.
          <br />
          <Link href="/" className="link-underline">
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}