export default function SectionTitle({
  title,
  description,
  action,
  as = "h2",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  as?: "h2" | "h3";
}) {
  const TitleTag = as;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div className="flex items-stretch gap-4">
        <span
          aria-hidden
          className="w-1 shrink-0 rounded-full bg-cyan-accent"
          style={{ minWidth: 4 }}
        />
        <div>
          <TitleTag className="text-lg sm:text-xl font-bold text-navy-dark leading-tight">
            {title}
          </TitleTag>
          {description && (
            <p className="text-sm text-slate-gray mt-1 max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}
