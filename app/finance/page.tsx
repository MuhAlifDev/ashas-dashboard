"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDashboard } from "../_components/DashboardProvider";
import PageHeader from "../_components/PageHeader";
import SectionTitle from "../_components/SectionTitle";
import Button from "../_components/Button";
import Modal from "../_components/Modal";
import EmptyState from "../_components/EmptyState";
import { Field, Input, Select } from "../_components/FormField";
import { formatDate, formatIDR } from "../_lib/format";
import type { TransactionStatus, TransactionType } from "../_lib/types";

type Period = "month" | "quarter" | "half" | "year" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Bulan Ini",
  quarter: "3 Bulan",
  half: "6 Bulan",
  year: "Tahun Ini",
  all: "Semua Waktu",
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export default function FinancePage() {
  const { data, addTransaction, updateTransaction, deleteTransaction } = useDashboard();

  const [period, setPeriod] = useState<Period>("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    type: "income" as TransactionType,
    description: "",
    amount: "",
    clientId: "",
    projectId: "",
    status: "paid" as TransactionStatus,
    date: todayISO(),
  });

  // Period filter
  const now = new Date();
  const periodStart = useMemo(() => {
    if (period === "all") return "";
    if (period === "month") return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const months = period === "quarter" ? 3 : period === "half" ? 6 : 12;
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [period]);

  const periodTx = useMemo(
    () => data.transactions.filter((t) => period === "all" ? true : t.date.slice(0, 7) >= periodStart),
    [data.transactions, period, periodStart],
  );

  // KPIs
  const totalIncome = periodTx.filter((t) => t.type === "income" && t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalExpense = periodTx.filter((t) => t.type === "expense" && t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const pendingIncome = data.transactions.filter((t) => t.type === "income" && t.status !== "paid").reduce((s, t) => s + t.amount, 0);

  // Monthly cash flow (last 12 months)
  const cashFlowMonths = useMemo(() => {
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return months.map((m) => ({
      key: m,
      label: monthLabel(m),
      income: data.transactions.filter((t) => t.type === "income" && t.status === "paid" && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0),
      expense: data.transactions.filter((t) => t.type === "expense" && t.status === "paid" && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0),
    })).map((m) => ({ ...m, net: m.income - m.expense }));
  }, [data.transactions]);

  const maxBarValue = Math.max(...cashFlowMonths.map((m) => Math.max(m.income, m.expense)), 1);

  // Revenue by project
  const projectRevenue = useMemo(() =>
    data.projects.map((p) => {
      const inc = data.transactions.filter((t) => t.projectId === p.id && t.type === "income" && t.status === "paid").reduce((s, t) => s + t.amount, 0);
      const exp = data.transactions.filter((t) => t.projectId === p.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const client = data.clients.find((c) => c.id === p.clientId);
      return { p, client, inc, exp, net: inc - exp };
    }).filter((x) => x.inc > 0 || x.exp > 0).sort((a, b) => b.net - a.net),
    [data.projects, data.transactions, data.clients],
  );

  // Revenue by client
  const clientRevenue = useMemo(() =>
    data.clients.map((c) => {
      const inc = data.transactions.filter((t) => t.clientId === c.id && t.type === "income" && t.status === "paid").reduce((s, t) => s + t.amount, 0);
      const exp = data.transactions.filter((t) => t.clientId === c.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { c, inc, exp, net: inc - exp };
    }).filter((x) => x.inc > 0 || x.exp > 0).sort((a, b) => b.inc - a.inc),
    [data.clients, data.transactions],
  );

  // Budget utilization
  const budgetProjects = useMemo(() =>
    data.projects.filter((p) => p.budget !== undefined && p.budget > 0).map((p) => {
      const spent = data.transactions.filter((t) => t.projectId === p.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const pct = Math.round((spent / p.budget!) * 100);
      return { p, spent, pct, remaining: p.budget! - spent };
    }).sort((a, b) => b.pct - a.pct),
    [data.projects, data.transactions],
  );

  // P&L
  const pnl = {
    grossIncome: totalIncome,
    operationalExpense: totalExpense,
    grossProfit: netProfit,
    pendingRevenue: periodTx.filter((t) => t.type === "income" && t.status === "pending").reduce((s, t) => s + t.amount, 0),
  };

  function openCreate(type: TransactionType = "income") {
    setTxForm({ type, description: "", amount: "", clientId: "", projectId: "", status: type === "income" ? "pending" : "paid", date: todayISO() });
    setModalOpen(true);
  }
  async function submitTx() {
    if (!txForm.description.trim() || !txForm.amount) return;
    await addTransaction({ type: txForm.type, description: txForm.description.trim(), amount: Number(txForm.amount), clientId: txForm.clientId || undefined, projectId: txForm.projectId || undefined, status: txForm.status, date: txForm.date || todayISO() });
    setModalOpen(false);
  }

  const allTx = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader title="Keuangan" description="Laporan keuangan dan manajemen uang agency Anda"
        action={<div className="flex gap-2"><Button onClick={() => openCreate("income")}>+ Pemasukan</Button><Button variant="secondary" onClick={() => openCreate("expense")}>− Pengeluaran</Button></div>} />

      {/* Period selector */}
      <div className="flex gap-1 rounded-md border border-slate-gray/20 bg-white p-1 w-fit mb-10">
        {(["month", "quarter", "half", "year", "all"] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${period === p ? "bg-navy-dark text-off-white" : "text-slate-gray hover:bg-off-white"}`}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-16">
        {[
          { label: "Pemasukan", value: formatIDR(totalIncome), tone: "positive" },
          { label: "Pengeluaran", value: formatIDR(totalExpense), tone: "danger" },
          { label: "Profit Bersih", value: formatIDR(netProfit), tone: netProfit >= 0 ? "positive" : "danger" },
          { label: "Margin", value: `${profitMargin}%`, tone: profitMargin >= 30 ? "positive" : profitMargin >= 0 ? "warning" : "danger" },
          { label: "Piutang", value: formatIDR(pendingIncome), tone: pendingIncome > 0 ? "warning" : "default" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-gray/20 bg-white p-5">
            <div className="h-0.5 w-6 bg-cyan-accent rounded-full mb-3" />
            <div className={`text-xl font-extrabold break-words ${s.tone === "positive" ? "text-emerald-600" : s.tone === "danger" ? "text-rose-600" : s.tone === "warning" ? "text-amber-600" : "text-navy-dark"}`}>{s.value}</div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CASH FLOW */}
      <section className="mb-16">
        <SectionTitle title="Arus Kas — 12 Bulan Terakhir" description="Pemasukan (hijau) vs pengeluaran (merah) per bulan" />
        <div className="rounded-lg border border-slate-gray/20 bg-white p-6">
          <div className="flex items-end gap-2 h-40 mb-3">
            {cashFlowMonths.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center">
                <div className="w-full flex gap-0.5 items-end h-32">
                  <div className="flex-1 bg-emerald-400 rounded-t transition-all" style={{ height: `${Math.max(2, (m.income / maxBarValue) * 100)}%` }} title={`Pemasukan: ${formatIDR(m.income)}`} />
                  <div className="flex-1 bg-rose-400 rounded-t transition-all" style={{ height: `${Math.max(2, (m.expense / maxBarValue) * 100)}%` }} title={`Pengeluaran: ${formatIDR(m.expense)}`} />
                </div>
                <div className={`text-[9px] font-bold mt-1 ${m.key === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` ? "text-navy-dark" : "text-slate-gray"}`}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs font-bold text-slate-gray border-t border-slate-gray/15 pt-3">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />Pemasukan</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />Pengeluaran</span>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-gray/20 bg-white">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider font-bold text-slate-gray border-b border-slate-gray/15 bg-off-white">
                <th className="px-4 py-2">Bulan</th>
                <th className="px-4 py-2 text-right text-emerald-700">Pemasukan</th>
                <th className="px-4 py-2 text-right text-rose-700">Pengeluaran</th>
                <th className="px-4 py-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-gray/10">
              {[...cashFlowMonths].reverse().slice(0, 6).map((m) => (
                <tr key={m.key} className="hover:bg-off-white">
                  <td className="px-4 py-2 font-bold text-navy-dark">{m.label}</td>
                  <td className="px-4 py-2 text-right text-emerald-600 font-bold">{m.income > 0 ? formatIDR(m.income) : "—"}</td>
                  <td className="px-4 py-2 text-right text-rose-600 font-bold">{m.expense > 0 ? formatIDR(m.expense) : "—"}</td>
                  <td className={`px-4 py-2 text-right font-extrabold ${m.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{m.net !== 0 ? formatIDR(m.net) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* P&L */}
      <section className="mb-16">
        <SectionTitle title={`Laporan Laba Rugi — ${PERIOD_LABELS[period]}`} description="Ringkasan pendapatan, beban, dan profit bersih" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-lg border border-slate-gray/20 bg-white p-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-gray">Pendapatan</div>
            <PLRow label="Pemasukan Diterima" value={pnl.grossIncome} tone="positive" />
            <PLRow label="Piutang Pending" value={pnl.pendingRevenue} tone="warning" indent />
            <PLRow label="Proyeksi Pendapatan" value={pnl.grossIncome + pnl.pendingRevenue} tone="default" bold />
            <div className="border-t border-slate-gray/15 pt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-gray">Beban</div>
            </div>
            <PLRow label="Total Pengeluaran" value={pnl.operationalExpense} tone="danger" />
          </div>
          <div className="rounded-lg border border-slate-gray/20 bg-white p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">Profit Bersih</div>
                <div className={`text-4xl font-extrabold mt-2 ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatIDR(netProfit)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mb-2">Margin Profit</div>
                <div className="h-2.5 w-full rounded-full bg-slate-gray/15 overflow-hidden">
                  <div className={`h-full rounded-full ${profitMargin >= 30 ? "bg-emerald-500" : profitMargin >= 0 ? "bg-amber-400" : "bg-rose-500"}`}
                    style={{ width: `${Math.min(100, Math.max(0, profitMargin))}%` }} />
                </div>
                <div className="text-sm font-extrabold mt-1 text-navy-dark">{profitMargin}%</div>
              </div>
            </div>
            <div className={`mt-6 rounded-lg px-4 py-3 text-sm font-bold ${profitMargin >= 30 ? "bg-emerald-50 text-emerald-700" : profitMargin >= 10 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
              {profitMargin >= 30 ? "✓ Margin sehat — bisnis berjalan baik" : profitMargin >= 10 ? "⚠ Margin tipis — perlu efisiensi biaya" : "⚠ Margin negatif — pemasukan perlu ditingkatkan"}
            </div>
          </div>
        </div>
      </section>

      {/* BUDGET UTILIZATION */}
      {budgetProjects.length > 0 && (
        <section className="mb-16">
          <SectionTitle title="Utilisasi Budget Project" description="Seberapa besar budget tiap project sudah terpakai" />
          <div className="rounded-lg border border-slate-gray/20 bg-white divide-y divide-slate-gray/10 overflow-hidden">
            {budgetProjects.map(({ p, spent, pct, remaining }) => (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/projects/${p.id}`} className="font-bold text-navy-dark text-sm hover:text-ashas-blue hover:underline">{p.name}</Link>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-rose-600">Terpakai: {formatIDR(spent)}</span>
                    <span className={remaining < 0 ? "text-rose-600" : "text-emerald-600"}>Sisa: {formatIDR(remaining)}</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-gray/15 overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-400" : "bg-ashas-blue"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <div className="text-[10px] text-slate-gray mt-1 font-bold">{pct}% dari {formatIDR(p.budget!)} terpakai</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REVENUE BY PROJECT */}
      {projectRevenue.length > 0 && (
        <section className="mb-16">
          <SectionTitle title="Profitabilitas per Project" description="Pemasukan, pengeluaran, dan profit bersih tiap project" />
          <div className="rounded-lg border border-slate-gray/20 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider font-bold text-slate-gray border-b border-slate-gray/15 bg-off-white">
                  <th className="px-5 py-2.5">Project</th>
                  <th className="px-5 py-2.5 text-right">Pemasukan</th>
                  <th className="px-5 py-2.5 text-right">Pengeluaran</th>
                  <th className="px-5 py-2.5 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-gray/10">
                {projectRevenue.map(({ p, client, inc, exp, net }) => (
                  <tr key={p.id} className="hover:bg-off-white">
                    <td className="px-5 py-3">
                      <Link href={`/projects/${p.id}`} className="font-bold text-navy-dark hover:text-ashas-blue hover:underline">{p.name}</Link>
                      {client && <div className="text-xs text-slate-gray">{client.name}</div>}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-600">{inc > 0 ? formatIDR(inc) : "—"}</td>
                    <td className="px-5 py-3 text-right font-bold text-rose-600">{exp > 0 ? formatIDR(exp) : "—"}</td>
                    <td className={`px-5 py-3 text-right font-extrabold ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatIDR(net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* REVENUE BY CLIENT */}
      {clientRevenue.length > 0 && (
        <section className="mb-16">
          <SectionTitle title="Pendapatan per Klien" description="Total pemasukan yang sudah diterima dari masing-masing klien" />
          <div className="rounded-lg border border-slate-gray/20 bg-white overflow-hidden">
            {clientRevenue.map(({ c, inc }, i) => {
              const maxInc = Math.max(...clientRevenue.map((x) => x.inc), 1);
              return (
                <div key={c.id} className={`px-5 py-4 ${i > 0 ? "border-t border-slate-gray/10" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/clients/${c.id}`} className="font-bold text-navy-dark hover:text-ashas-blue hover:underline text-sm">{c.name}</Link>
                    <span className="font-extrabold text-emerald-600 text-sm">{formatIDR(inc)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-gray/15 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.round((inc / maxInc) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TRANSACTIONS */}
      <section className="mb-16">
        <SectionTitle title="Semua Transaksi" description="Riwayat lengkap pemasukan dan pengeluaran"
          action={<div className="flex gap-2"><Button onClick={() => openCreate("income")}>+ Pemasukan</Button><Button variant="secondary" onClick={() => openCreate("expense")}>− Pengeluaran</Button></div>} />
        {allTx.length === 0 ? (
          <EmptyState title="Belum ada transaksi" description="Catat transaksi pertama Anda." action={<Button onClick={() => openCreate()}>+ Tambah</Button>} />
        ) : (
          <div className="rounded-lg border border-slate-gray/20 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider font-bold text-slate-gray border-b border-slate-gray/15 bg-off-white">
                    <th className="px-5 py-2.5">Tanggal</th>
                    <th className="px-5 py-2.5">Deskripsi</th>
                    <th className="px-5 py-2.5">Klien</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Jumlah</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-gray/10">
                  {allTx.map((t) => {
                    const client = data.clients.find((c) => c.id === t.clientId);
                    const project = data.projects.find((p) => p.id === t.projectId);
                    return (
                      <tr key={t.id} className="group hover:bg-off-white">
                        <td className="px-5 py-3 text-slate-gray whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="px-5 py-3">
                          <div className="font-bold text-navy-dark">{t.description}</div>
                          {project && <div className="text-xs text-slate-gray">{project.name}</div>}
                        </td>
                        <td className="px-5 py-3 text-slate-gray text-xs">{client?.name ?? "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${t.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : t.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                            {t.status === "paid" ? "Lunas" : t.status === "pending" ? "Pending" : "Terlambat"}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-right font-extrabold whitespace-nowrap ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                          {t.type === "income" ? "+" : "−"} {formatIDR(t.amount)}
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            {t.status !== "paid" && (
                              <button onClick={() => updateTransaction(t.id, { status: "paid" })}
                                className="text-xs font-bold text-ashas-blue hover:text-navy-dark px-2 py-1 rounded hover:bg-white">Lunas</button>
                            )}
                            <button onClick={() => { if (confirm("Hapus transaksi ini?")) deleteTransaction(t.id); }}
                              className="text-xs font-bold text-rose-600 px-2 py-1 rounded hover:bg-rose-50">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={txForm.type === "income" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={submitTx}>Simpan</Button></>}>
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["income", "expense"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setTxForm({ ...txForm, type: s, status: s === "income" ? "pending" : "paid" })}
                className={`flex-1 rounded-md border px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${txForm.type === s ? (s === "income" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-rose-600 bg-rose-50 text-rose-700") : "border-slate-gray/40 bg-white text-slate-gray hover:bg-off-white"}`}>
                {s === "income" ? "+ Pemasukan" : "− Pengeluaran"}
              </button>
            ))}
          </div>
          <Field label="Deskripsi *"><Input value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} placeholder="Contoh: DP project, lisensi tools…" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jumlah (IDR) *"><Input type="number" min={0} value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} /></Field>
            <Field label="Tanggal"><Input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Klien">
              <Select value={txForm.clientId} onChange={(e) => setTxForm({ ...txForm, clientId: e.target.value })}>
                <option value="">— Tidak ada —</option>
                {data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Project">
              <Select value={txForm.projectId} onChange={(e) => setTxForm({ ...txForm, projectId: e.target.value })}>
                <option value="">— Tidak ada —</option>
                {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Status">
            <Select value={txForm.status} onChange={(e) => setTxForm({ ...txForm, status: e.target.value as TransactionStatus })}>
              {txForm.type === "income" ? <><option value="pending">Pending</option><option value="paid">Lunas</option><option value="overdue">Terlambat</option></> : <><option value="paid">Sudah dibayar</option><option value="pending">Belum dibayar</option></>}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function PLRow({ label, value, tone, indent, bold }: { label: string; value: number; tone: "positive"|"danger"|"warning"|"default"; indent?: boolean; bold?: boolean }) {
  const toneClass = tone === "positive" ? "text-emerald-600" : tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : "text-navy-dark";
  return (
    <div className={`flex items-center justify-between ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${bold ? "font-extrabold text-navy-dark" : "text-slate-gray"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-extrabold" : "font-bold"} ${toneClass}`}>{formatIDR(value)}</span>
    </div>
  );
}
