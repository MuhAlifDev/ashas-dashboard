export default function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "positive" | "warning" | "danger" | "accent";
}) {
  const toneClasses: Record<string, string> = {
    default: "text-navy-dark",
    positive: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-rose-600",
    accent: "text-ashas-blue",
  };
  return (
    <div className="rounded-lg border border-slate-gray/20 bg-white p-8">
      <div className="h-0.5 w-8 bg-cyan-accent rounded-full mb-4" />
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-gray">
        {label}
      </div>
      <div
        className={`mt-3 text-3xl font-extrabold tracking-tight ${toneClasses[tone]}`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-xs text-slate-gray font-bold">{hint}</div>
      )}
    </div>
  );
}
