export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "brand" | "success" | "warn" | "danger" | "muted" }) {
  const tones: Record<string, string> = {
    neutral: "bg-sand text-stone border-line",
    brand: "bg-brass/15 text-brass-deep border-brass/30",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-800 border-red-200",
    muted: "bg-white text-fog border-line",
  };
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-line bg-white ${className}`}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="display text-3xl text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-stone">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, tone = "neutral" }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "neutral" | "brand" | "success" | "danger" }) {
  const toneClasses: Record<string, string> = {
    neutral: "text-ink",
    brand: "text-brass-deep",
    success: "text-emerald-700",
    danger: "text-red-700",
  };
  return (
    <Card className="p-5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">{label}</p>
      <p className={`display mt-2 text-[2rem] leading-none ${toneClasses[tone]}`}>{value}</p>
      {sub && <p className="mt-2 text-[0.8rem] text-stone">{sub}</p>}
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <Card className="p-12 text-center">
      <p className="display text-2xl text-ink">{title}</p>
      {body && <p className="mx-auto mt-3 max-w-md text-[0.9rem] leading-relaxed text-stone">{body}</p>}
    </Card>
  );
}

export function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`whitespace-nowrap px-4 py-3 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`border-t border-line px-4 py-3 align-middle text-[0.85rem] text-stone ${className}`}>{children}</td>;
}