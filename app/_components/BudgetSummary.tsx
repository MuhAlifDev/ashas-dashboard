import { formatIDR } from "../_lib/format";
import type { ProjectBudgetSnapshot } from "../_lib/derived";

/**
 * Renders a "Ringkasan Anggaran" panel: Budget, Diterima (+), Dikeluarkan (−),
 * Net Cash (red if negative), Sisa Budget. Used in client detail project
 * subcards and the project list cards.
 */
export default function BudgetSummary({
  snapshot,
  variant = "panel",
}: {
  snapshot: ProjectBudgetSnapshot;
  variant?: "panel" | "compact";
}) {
  const {
    budget,
    incomePaid,
    expensesPaid,
    netCash,
    budgetRemaining,
  } = snapshot;
  const overspent = budgetRemaining !== null && budgetRemaining < 0;
  const cashNegative = netCash < 0;

  if (variant === "compact") {
    return (
      <div className="rounded-md bg-off-white px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Stat
          label="Diterima"
          value={`+ ${formatIDR(incomePaid)}`}
          tone="positive"
        />
        <Stat
          label="Dikeluarkan"
          value={`− ${formatIDR(expensesPaid)}`}
          tone="danger"
        />
        <Stat
          label="Net Cash"
          value={`${cashNegative ? "− " : ""}${formatIDR(Math.abs(netCash))}`}
          tone={cashNegative ? "danger" : netCash > 0 ? "positive" : "default"}
          emphasis
        />
        <Stat
          label="Sisa Budget"
          value={
            budgetRemaining === null ? "-" : formatIDR(budgetRemaining)
          }
          tone={
            budgetRemaining === null
              ? "default"
              : overspent
                ? "danger"
                : "default"
          }
          emphasis
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-gray/20 bg-off-white">
      <div className="px-5 py-3 border-b border-slate-gray/15 flex items-center gap-3">
        <span className="block w-1 h-4 bg-cyan-accent rounded-full" />
        <h4 className="text-[11px] uppercase tracking-wider font-bold text-navy-dark">
          Ringkasan Anggaran
        </h4>
      </div>
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        <Stat
          label="Budget"
          value={budget !== undefined ? formatIDR(budget) : "-"}
          tone="default"
        />
        <Stat
          label="Diterima"
          value={`+ ${formatIDR(incomePaid)}`}
          tone="positive"
        />
        <Stat
          label="Dikeluarkan"
          value={`− ${formatIDR(expensesPaid)}`}
          tone="danger"
        />
      </div>
      <div className="border-t border-slate-gray/15 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">
            Net Cash
          </div>
          <div
            className={`text-xl font-extrabold mt-1 ${
              cashNegative
                ? "text-rose-600"
                : netCash > 0
                  ? "text-emerald-600"
                  : "text-navy-dark"
            }`}
          >
            {cashNegative ? "− " : netCash > 0 ? "+ " : ""}
            {formatIDR(Math.abs(netCash))}
          </div>
          <div className="text-[11px] text-slate-gray mt-1">
            {cashNegative
              ? "⚠ Pengeluaran melebihi pemasukan"
              : netCash === 0
                ? "Pemasukan = pengeluaran"
                : "Pemasukan > pengeluaran"}
          </div>
        </div>
        <div className="sm:border-l sm:border-slate-gray/15 sm:pl-4">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">
            Sisa Budget
          </div>
          <div
            className={`text-xl font-extrabold mt-1 ${
              budgetRemaining === null
                ? "text-slate-gray"
                : overspent
                  ? "text-rose-600"
                  : "text-navy-dark"
            }`}
          >
            {budgetRemaining === null ? "—" : formatIDR(budgetRemaining)}
          </div>
          <div className="text-[11px] text-slate-gray mt-1">
            {budgetRemaining === null
              ? "Project tanpa budget"
              : overspent
                ? "⚠ Pengeluaran melebihi budget"
                : "Tersedia untuk pengeluaran"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string;
  value: string;
  tone: "default" | "positive" | "danger";
  emphasis?: boolean;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "danger"
        ? "text-rose-600"
        : "text-navy-dark";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">
        {label}
      </div>
      <div
        className={`${emphasis ? "text-base" : "text-sm"} font-extrabold mt-1 ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}
