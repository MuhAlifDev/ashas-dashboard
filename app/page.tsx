"use client";

import Link from "next/link";
import { useDashboard } from "./_components/DashboardProvider";
import PageHeader from "./_components/PageHeader";
import SectionTitle from "./_components/SectionTitle";
import StatCard from "./_components/StatCard";
import Badge from "./_components/Badge";
import { daysUntil, formatDate, formatIDR } from "./_lib/format";
import {
  projectStatusLabel,
  projectStatusTone,
  transactionStatusTone,
} from "./_lib/labels";
import { getProjectDeadline } from "./_lib/derived";

export default function DashboardHome() {
  const { data, ready } = useDashboard();

  const activeClients = data.clients.filter(
    (c) => c.status === "active",
  ).length;
  const leadClients = data.clients.filter((c) => c.status === "lead").length;
  const activeProjects = data.projects.filter(
    (p) => p.status === "in-progress" || p.status === "review",
  ).length;
  const pendingTasks = data.tasks.filter((t) => t.status !== "done").length;
  const overdueTasks = data.tasks.filter((t) => {
    if (t.status === "done") return false;
    const days = daysUntil(t.dueDate);
    return days !== null && days < 0;
  }).length;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthIncome = data.transactions
    .filter(
      (t) =>
        t.type === "income" &&
        t.status === "paid" &&
        t.date.startsWith(monthKey),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingIncome = data.transactions
    .filter((t) => t.type === "income" && t.status !== "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  // Deadline warnings: active projects where deadline ≤ 14 days AND progress < 80%,
  // OR already overdue and not completed
  const deadlineAlerts = data.projects
    .filter((p) => p.status !== "completed" && p.status !== "on-hold")
    .map((p) => {
      const dl = getProjectDeadline(p, data.clients);
      const days = daysUntil(dl);
      return { p, deadline: dl, days };
    })
    .filter(({ days }) => days !== null && days <= 14)
    .filter(({ days, p }) => (days !== null && days < 0) || p.progress < 80)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

  const recentProjects = [...data.projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const upcomingTasks = data.tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 5);

  const recentTransactions = [...data.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const getClient = (id?: string) =>
    id ? data.clients.find((c) => c.id === id) : undefined;

  return (
    <div>
      {deadlineAlerts.length > 0 && (
        <div className="mb-8 rounded-lg border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-600">⚠</span>
            <h2 className="text-sm font-bold text-rose-700 uppercase tracking-wider">
              Perhatian — {deadlineAlerts.length} Project Mendekati Deadline
            </h2>
          </div>
          <ul className="space-y-2">
            {deadlineAlerts.map(({ p, days }) => {
              const client = data.clients.find((c) => c.id === p.clientId);
              return (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <Link href={`/projects/${p.id}`} className="text-sm font-bold text-rose-700 hover:underline truncate">
                    {p.name}
                    {client && <span className="font-normal text-rose-500"> · {client.name}</span>}
                  </Link>
                  <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-rose-600">
                    <span>{p.progress}% progress</span>
                    <span className="rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5">
                      {days !== null && days < 0 ? `Terlambat ${Math.abs(days)}h` : days === 0 ? "Hari ini!" : `${days} hari lagi`}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <PageHeader
        title="Dashboard"
        description={
          ready
            ? "Selamat datang kembali. Berikut rangkuman aktivitas agency Anda."
            : "Memuat data…"
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Klien Aktif"
          value={activeClients}
          hint={`${leadClients} prospek/lead`}
        />
        <StatCard
          label="Project Berjalan"
          value={activeProjects}
          hint={`dari ${data.projects.length} total project`}
        />
        <StatCard
          label="Tugas Pending"
          value={pendingTasks}
          tone={overdueTasks > 0 ? "danger" : "default"}
          hint={
            overdueTasks > 0
              ? `${overdueTasks} terlambat`
              : "Tidak ada yang terlambat"
          }
        />
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatIDR(monthIncome)}
          tone="positive"
          hint={
            pendingIncome > 0
              ? `${formatIDR(pendingIncome)} pending`
              : "Semua tagihan lunas"
          }
        />
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <SectionTitle
            title="Project Terbaru"
            description="Progress dan deadline project aktif"
            action={
              <Link
                href="/projects"
                className="text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark"
              >
                Lihat semua →
              </Link>
            }
          />
          <div className="rounded-lg border border-slate-gray/20 bg-white divide-y divide-slate-gray/15">
            {recentProjects.length === 0 ? (
              <div className="px-8 py-10 text-center text-sm text-slate-gray">
                Belum ada project.
              </div>
            ) : (
              recentProjects.map((p) => {
                const client = getClient(p.clientId);
                const deadline = getProjectDeadline(p, data.clients);
                const days = daysUntil(deadline);
                return (
                  <div key={p.id} className="px-8 py-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-navy-dark truncate">
                            {p.name}
                          </h3>
                          <Badge tone={projectStatusTone(p.status)}>
                            {projectStatusLabel(p.status)}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-gray mt-1">
                          {client?.name ?? "Tanpa klien"}
                          {deadline && (
                            <span className="ml-2">
                              · Deadline {formatDate(deadline)}
                              {days !== null && days >= 0 && (
                                <> ({days} hari lagi)</>
                              )}
                              {days !== null && days < 0 && (
                                <span className="text-rose-600 font-bold">
                                  {" "}
                                  (terlambat {Math.abs(days)} hari)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-navy-dark font-extrabold shrink-0">
                        {p.progress}%
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-gray/15">
                      <div
                        className="h-full bg-ashas-blue rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0, p.progress))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section>
          <SectionTitle
            title="Tugas Mendatang"
            description="Urutan berdasarkan deadline"
            action={
              <Link
                href="/tasks"
                className="text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark"
              >
                Semua →
              </Link>
            }
          />
          <div className="rounded-lg border border-slate-gray/20 bg-white divide-y divide-slate-gray/15">
            {upcomingTasks.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-gray">
                Tidak ada tugas pending.
              </div>
            ) : (
              upcomingTasks.map((t) => {
                const days = daysUntil(t.dueDate);
                return (
                  <div key={t.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          t.priority === "high"
                            ? "bg-rose-500"
                            : t.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-slate-gray"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-navy-dark truncate font-bold">
                          {t.title}
                        </div>
                        <div className="text-xs text-slate-gray mt-1">
                          {t.dueDate ? (
                            days !== null && days < 0 ? (
                              <span className="text-rose-600 font-bold">
                                Terlambat {Math.abs(days)} hari
                              </span>
                            ) : days === 0 ? (
                              <span className="text-amber-600 font-bold">
                                Hari ini
                              </span>
                            ) : (
                              <>
                                Dalam {days} hari · {formatDate(t.dueDate)}
                              </>
                            )
                          ) : (
                            "Tanpa deadline"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="mt-16">
        <SectionTitle
          title="Transaksi Terbaru"
          description="5 transaksi paling baru"
          action={
            <Link
              href="/finance"
              className="text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark"
            >
              Lihat semua →
            </Link>
          }
        />
        <div className="rounded-lg border border-slate-gray/20 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-gray font-bold border-b border-slate-gray/15 bg-off-white">
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Deskripsi</th>
                  <th className="px-6 py-3">Klien</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-gray/15">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-slate-gray"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 text-slate-gray whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-6 py-4 text-navy-dark font-bold">
                        {t.description}
                      </td>
                      <td className="px-6 py-4 text-slate-gray">
                        {getClient(t.clientId)?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={transactionStatusTone(t.status)}>
                          {t.status === "paid"
                            ? "Lunas"
                            : t.status === "pending"
                              ? "Pending"
                              : "Terlambat"}
                        </Badge>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-extrabold whitespace-nowrap ${
                          t.type === "income"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "−"} {formatIDR(t.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
