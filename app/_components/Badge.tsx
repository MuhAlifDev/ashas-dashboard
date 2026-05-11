type Tone =
  | "slate"
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "violet"
  | "cyan"
  | "navy";

const tones: Record<Tone, string> = {
  slate: "bg-slate-gray/15 text-navy-dark border-slate-gray/30",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-ashas-blue/15 text-ashas-blue border-ashas-blue/30",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  cyan: "bg-cyan-accent/15 text-navy-dark border-cyan-accent/40",
  navy: "bg-navy-dark text-off-white border-navy-dark",
};

export default function Badge({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
