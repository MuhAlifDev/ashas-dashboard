export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-12 lg:mb-16">
      <div>
        <div className="mb-3 h-1 w-12 bg-cyan-accent rounded-full" />
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-dark">
          {title}
        </h1>
        {description && (
          <p className="text-base text-slate-gray mt-3 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}
