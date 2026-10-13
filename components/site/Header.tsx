"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV, EXPERIENCE_MENU, EXPERIENCE_PATHS } from "@/lib/constants";
import { Logo } from "@/components/site/Logo";

const isPathActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const [open, setOpen] = useState(false);
  const [mobileExpand, setMobileExpand] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const experienceActive = EXPERIENCE_PATHS.some((path) => isPathActive(pathname, path));

  // The header is positioned at the top of the page over the hero and scrolls
  // away with the content — it is never fixed to the viewport. On the home
  // hero (dark full-bleed media at the top) the artwork and nav flip to their
  // light variants so they stay readable over the dark media.
  const darkSurface = open || pathname === "/";

  useEffect(() => {
    setOpen(false);
    setMobileExpand(false);
    setExperienceOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!experienceOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExperienceOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target instanceof Node ? event.target : null;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setExperienceOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [experienceOpen]);

  return (
    <header
      className={`absolute inset-x-0 top-0 z-50 transition-colors duration-300 ${
        open ? "bg-ink" : "bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Vela by Svasti — home" className="flex shrink-0 items-center">
          <Logo variant={darkSurface ? "light" : "dark"} layout="wordmark" height={38} priority />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {PRIMARY_NAV.map((item) => {
            if (item.href !== "/experience") {
              const active = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? `underline underline-offset-8 ${
                          darkSurface ? "text-brass" : "text-brass-deep"
                        }`
                      : darkSurface
                        ? "text-cream/85 hover:text-cream"
                        : "text-ink/80 hover:text-brass-deep"
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.href}
                ref={dropdownRef}
                onMouseEnter={() => setExperienceOpen(true)}
                onMouseLeave={() => setExperienceOpen(false)}
                onFocus={() => setExperienceOpen(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setExperienceOpen(false);
                  }
                }}
                className="relative"
              >
                <button
                  ref={triggerRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={experienceOpen}
                  aria-controls="experience-menu"
                  className={`flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    experienceActive
                      ? `underline underline-offset-8 ${
                          darkSurface ? "text-brass" : "text-brass-deep"
                        }`
                      : darkSurface
                        ? "text-cream/85 hover:text-cream"
                        : "text-ink/80 hover:text-brass-deep"
                  }`}
                >
                  {item.label}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className={`h-2 w-2 stroke-current transition-transform duration-200 ${
                      experienceOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M2 4l4 4 4-4" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div
                  id="experience-menu"
                  role="menu"
                  aria-label="Experience"
                  className={`absolute left-1/2 top-full z-50 w-[min(46rem,calc(100vw-2rem))] -translate-x-1/2 pt-4 transition-all duration-200 ease-out ${
                    experienceOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-1 opacity-0"
                  }`}
                >
                  <div
                    className={`grid gap-10 border border-line bg-white p-8 shadow-xl sm:grid-cols-2 ${experienceOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                  >
                    {EXPERIENCE_MENU.map((group) => {
                      const active = isPathActive(pathname, group.href);
                      return (
                        <div key={group.id}>
                          <p className="eyebrow mb-4">
                            <Link
                              href={group.href}
                              aria-current={active ? "page" : undefined}
                              onClick={() => setExperienceOpen(false)}
                              className={`transition-colors hover:text-brass-deep ${
                                active ? "text-brass-deep" : "text-ink"
                              }`}
                            >
                              {group.label}
                            </Link>
                          </p>
                          <ul className="space-y-2.5 border-l border-line pl-4">
                            {group.items.map((item) => (
                              <li key={item.label}>
                                <Link
                                  href={item.href}
                                  role="menuitem"
                                  onClick={() => setExperienceOpen(false)}
                                  className="text-[0.88rem] text-stone transition-colors hover:text-ink"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                    <Link
                      href="/experience"
                      role="menuitem"
                      onClick={() => setExperienceOpen(false)}
                      className="sm:col-span-2 text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-brass-deep transition-colors hover:text-ink"
                    >
                      Explore all experiences →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 lg:gap-5">
          <Link
            href="/admin/login"
            aria-label="Admin login — hotel staff only"
            className={`hidden text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors lg:inline-flex ${
              darkSurface ? "text-cream/60 hover:text-cream" : "text-fog hover:text-ink"
            }`}
          >
            Admin Login
          </Link>
          <Link href="/enquire" className="btn-brass hidden px-5 py-2.5 sm:inline-flex">
            Enquire Now
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`inline-flex h-10 w-10 flex-col items-center justify-center gap-[5px] border transition-colors lg:hidden ${
              darkSurface ? "border-cream/25 bg-transparent" : "border-line bg-white"
            }`}
          >
            <span
              className={`h-px w-5 transition-transform ${darkSurface ? "bg-cream" : "bg-ink"} ${
                open ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-5 transition-opacity ${darkSurface ? "bg-cream" : "bg-ink"} ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-px w-5 transition-transform ${darkSurface ? "bg-cream" : "bg-ink"} ${
                open ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-0 top-16 z-40 flex flex-col bg-ink text-cream transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="shell flex flex-1 flex-col gap-1 overflow-y-auto py-8" aria-label="Mobile">
          {PRIMARY_NAV.map((item, index) => {
            if (item.href === "/experience") {
              const active = experienceActive;
              return (
                <div key={item.href}>
                  <button
                    type="button"
                    onClick={() => setMobileExpand((value) => !value)}
                    aria-expanded={mobileExpand}
                    aria-controls="mobile-experience"
                    className={`display flex w-full items-center justify-between border-b border-cream/10 py-4 text-left text-[1.7rem] transition-colors ${
                      active ? "text-brass" : "text-cream/90"
                    }`}
                    style={{ transitionDelay: `${index * 20}ms` }}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`text-[1.3rem] text-brass transition-transform duration-200 ${
                        mobileExpand ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                  {mobileExpand && (
                    <div id="mobile-experience" className="pt-3">
                      {EXPERIENCE_MENU.map((group) => (
                        <div key={group.id} className="mb-4">
                          <Link
                            href={group.href}
                            aria-current={isPathActive(pathname, group.href) ? "page" : undefined}
                            onClick={() => setOpen(false)}
                            className="inline-block text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-brass"
                          >
                            {group.label}
                          </Link>
                          <ul className="mt-2 space-y-1.5 border-l border-cream/15 pl-4">
                            {group.items.map((item) => (
                              <li key={item.label}>
                                <Link
                                  href={item.href}
                                  onClick={() => setOpen(false)}
                                  className="text-[0.98rem] text-cream/75 transition-colors hover:text-cream"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link
                        href="/experience"
                        onClick={() => setOpen(false)}
                        className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-brass"
                      >
                        Explore all experiences →
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            const active = isPathActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`display border-b border-cream/10 py-4 text-[1.7rem] transition-colors ${
                  active ? "text-brass" : "text-cream/90"
                }`}
                style={{ transitionDelay: `${index * 20}ms` }}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="mt-6 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-cream"
          >
            Admin Login
          </Link>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/enquire" onClick={() => setOpen(false)} className="btn-brass w-full">
              Enquire Now
            </Link>
            <p className="pt-2 text-[0.8rem] uppercase tracking-[0.2em] text-fog">
              VIP Chowk · Raipur · Chhattisgarh
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}