import Link from "next/link";
import { navItemsForUser } from "@/lib/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { Logo } from "@/components/site/Logo";
import type { AdminUser } from "@/lib/admin-guard";

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const nav = navItemsForUser(user);

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-line bg-white">
        <Link href="/admin" className="block border-b border-line px-6 py-5">
          <Logo variant="dark" layout="wordmark" height={34} />
        </Link>
        <nav className="flex-1 overflow-y-auto py-4" aria-label="Admin">
          {Object.entries(
            nav.reduce<Record<string, typeof nav>>((groups, item) => {
              (groups[item.group] ??= []).push(item);
              return groups;
            }, {}),
          ).map(([group, items]) => (
            <div key={group} className="mb-5">
              <p className="px-6 pb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-fog">{group}</p>
              <ul>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block border-l-2 border-transparent px-6 py-2 text-[0.85rem] font-medium text-stone transition-colors hover:bg-sand hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream/95 px-8 py-4 backdrop-blur">
          <div>
            <p className="font-medium text-ink">{user.name}</p>
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-fog">{user.role.name}</p>
          </div>
          <LogoutButton />
        </header>
        <main className="p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}