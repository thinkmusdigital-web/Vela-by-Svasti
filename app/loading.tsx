import { Logo } from "@/components/site/Logo";

/** Route-level splash shown while a page segment streams in. */
export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso"
      role="status"
      aria-label="Loading Vela by Svasti"
    >
      <Logo
        variant="dark-card"
        layout="full"
        height={220}
        priority
        className="splash-logo h-auto w-[clamp(11rem,26vw,16rem)]"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
