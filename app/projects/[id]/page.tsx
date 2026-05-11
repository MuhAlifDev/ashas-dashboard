"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useDashboard } from "../../_components/DashboardProvider";
import PageHeader from "../../_components/PageHeader";
import SectionTitle from "../../_components/SectionTitle";
import Button from "../../_components/Button";
import Badge from "../../_components/Badge";
import BudgetSummary from "../../_components/BudgetSummary";
import EmptyState from "../../_components/EmptyState";
import Modal from "../../_components/Modal";
import { Field, Input, Select, Textarea } from "../../_components/FormField";
import { projectStatusLabel, projectStatusTone } from "../../_lib/labels";
import { daysUntil, formatDate, formatIDR } from "../../_lib/format";
import { getProjectBudgetSnapshot, getProjectDeadline } from "../../_lib/derived";
import type { MeetingNote, TaskPriority, TransactionStatus, TransactionType } from "../../_lib/types";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-slate-gray",
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const {
    data,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    addRevision,
    updateRevision,
    deleteRevision,
    addDailyLog,
    deleteDailyLog,
    addMeetingNote,
    updateMeetingNote,
    deleteMeetingNote,
    addTransaction,
  } = useDashboard();

  const project = data.projects.find((p) => p.id === id);
  const client = project?.clientId ? data.clients.find((c) => c.id === project.clientId) : undefined;
  const deadline = project ? getProjectDeadline(project, data.clients) : undefined;
  const days = daysUntil(deadline);
  const snapshot = project ? getProjectBudgetSnapshot(project, data.transactions) : null;

  const projectTasks = useMemo(
    () => data.tasks.filter((t) => t.projectId === id)
      .sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0)),
    [data.tasks, id],
  );
  const projectRevisions = useMemo(
    () => data.revisions.filter((r) => r.projectId === id)
      .sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0)
        || b.requestedDate.localeCompare(a.requestedDate)),
    [data.revisions, id],
  );
  const today = todayISO();
  const todayLogs = useMemo(
    () => data.dailyLogs.filter((l) => l.projectId === id && l.date === today)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.dailyLogs, id, today],
  );
  const allLogs = useMemo(
    () => data.dailyLogs.filter((l) => l.projectId === id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [data.dailyLogs, id],
  );
  const logsByDate = useMemo(() => {
    const grouped = new Map<string, typeof allLogs>();
    for (const l of allLogs) {
      const existing = grouped.get(l.date) ?? [];
      existing.push(l);
      grouped.set(l.date, existing);
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allLogs]);
  const projectTransactions = useMemo(
    () => data.transactions.filter((t) => t.projectId === id).sort((a, b) => b.date.localeCompare(a.date)),
    [data.transactions, id],
  );
  const projectMeetings = useMemo(
    () => data.meetingNotes.filter((m) => m.projectId === id).sort((a, b) => b.date.localeCompare(a.date)),
    [data.meetingNotes, id],
  );

  // Timeline
  type TEvent = { date: string; type: "start"|"meeting"|"task"|"payment"|"revision"|"log"; label: string; detail?: string };
  const timeline = useMemo<TEvent[]>(() => {
    if (!project) return [];
    const events: TEvent[] = [];
    events.push({ date: project.createdAt.slice(0, 10), type: "start", label: `Project "${project.name}" dimulai` });
    projectMeetings.forEach((m) => events.push({ date: m.date, type: "meeting", label: `Meeting: ${m.title}`, detail: m.content.slice(0, 80) }));
    projectTasks.filter((t) => t.status === "done").forEach((t) =>
      events.push({ date: t.dueDate ?? t.createdAt.slice(0, 10), type: "task", label: `Task selesai: ${t.title}` }),
    );
    projectTransactions.forEach((t) =>
      events.push({ date: t.date, type: "payment", label: `${t.type === "income" ? "Pemasukan" : "Pengeluaran"}: ${t.description}`, detail: formatIDR(t.amount) }),
    );
    projectRevisions.forEach((r) =>
      events.push({ date: r.requestedDate, type: "revision", label: `Revisi: ${r.title}`, detail: r.status === "done" ? "Selesai" : "Diminta" }),
    );
    data.dailyLogs.filter((l) => l.projectId === id).forEach((l) =>
      events.push({ date: l.date, type: "log", label: l.note }),
    );
    return events.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  }, [project, projectMeetings, projectTasks, projectTransactions, projectRevisions, data.dailyLogs, id]);

  const DOT_COLOR: Record<TEvent["type"], string> = {
    start: "bg-navy-dark", meeting: "bg-cyan-accent", task: "bg-emerald-500",
    payment: "bg-ashas-blue", revision: "bg-amber-400", log: "bg-slate-gray",
  };

  // Daily log
  const [logInput, setLogInput] = useState("");
  const logInputRef = useRef<HTMLInputElement>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);
  async function submitLog() {
    const note = logInput.trim();
    if (!note) return;
    setLogInput("");
    await addDailyLog({ projectId: id, note, date: today });
    logInputRef.current?.focus();
  }

  // Revision
  const [revModalOpen, setRevModalOpen] = useState(false);
  const [revBulk, setRevBulk] = useState("");
  const [revCreateTask, setRevCreateTask] = useState(false);
  async function submitRevisions() {
    const lines = revBulk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    await Promise.all(lines.flatMap((title) => {
      const ops = [addRevision({ clientId: client?.id ?? "", projectId: id, title, status: "requested", requestedDate: today })];
      if (revCreateTask) ops.push(addTask({ title, projectId: id, status: "todo", priority: "medium" }));
      return ops;
    }));
    setRevBulk("");
    setRevCreateTask(false);
    setRevModalOpen(false);
  }

  // Task edit
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskEditForm, setTaskEditForm] = useState({ priority: "medium" as TaskPriority, dueDate: "" });
  function openTaskEdit(t: { id: string; priority: TaskPriority; dueDate?: string }) {
    setEditingTaskId(t.id);
    setTaskEditForm({ priority: t.priority, dueDate: t.dueDate ?? "" });
  }
  async function saveTaskEdit() {
    if (!editingTaskId) return;
    await updateTask(editingTaskId, { priority: taskEditForm.priority, dueDate: taskEditForm.dueDate || undefined });
    setEditingTaskId(null);
  }

  // Task bulk
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskBulk, setTaskBulk] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  async function submitTasks() {
    const lines = taskBulk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    await Promise.all(lines.map((title) => addTask({ title, projectId: id, status: "todo", priority: taskPriority })));
    setTaskBulk("");
    setTaskModalOpen(false);
  }

  // Transaction
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({ type: "income" as TransactionType, description: "", amount: "", status: "paid" as TransactionStatus, date: todayISO() });
  function openTx(type: TransactionType) {
    setTxForm({ type, description: "", amount: "", status: type === "income" ? "pending" : "paid", date: todayISO() });
    setTxModalOpen(true);
  }
  async function submitTx() {
    if (!txForm.description.trim() || !txForm.amount) return;
    await addTransaction({ type: txForm.type, description: txForm.description.trim(), amount: Number(txForm.amount), clientId: client?.id, projectId: id, status: txForm.status, date: txForm.date || todayISO() });
    setTxModalOpen(false);
  }

  // Meeting notes
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState({ title: "", content: "", date: todayISO() });
  function openCreateMeeting() { setEditingMeetingId(null); setMeetingForm({ title: "", content: "", date: todayISO() }); setMeetingModalOpen(true); }
  function openEditMeeting(m: MeetingNote) { setEditingMeetingId(m.id); setMeetingForm({ title: m.title, content: m.content, date: m.date }); setMeetingModalOpen(true); }
  async function submitMeeting() {
    if (!meetingForm.title.trim() || !client) return;
    const payload = { clientId: client.id, projectId: id, title: meetingForm.title.trim(), content: meetingForm.content.trim(), date: meetingForm.date || todayISO() };
    if (editingMeetingId) await updateMeetingNote(editingMeetingId, payload);
    else await addMeetingNote(payload);
    setMeetingModalOpen(false);
  }

  if (!project) {
    return (
      <div>
        <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark mb-6">← Kembali ke daftar project</Link>
        <EmptyState title="Project tidak ditemukan" description="Project ini mungkin sudah dihapus." action={<Link href="/projects"><Button>Kembali ke Project</Button></Link>} />
      </div>
    );
  }

  return (
    <div>
      <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark mb-6">← Kembali ke daftar project</Link>

      <PageHeader
        title={project.name}
        description={client ? (<Link href={`/clients/${client.id}`} className="hover:underline" style={{ color: "#3E7FA3" }}>{client.name}{client.company ? ` · ${client.company}` : ""}</Link>) as unknown as string : undefined}
        action={<Badge tone={projectStatusTone(project.status)}>{projectStatusLabel(project.status)}</Badge>}
      />

      {/* OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
        <div className="lg:col-span-2 space-y-6">
          {project.description && <p className="text-base text-slate-gray">{project.description}</p>}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">Progress</span>
              <span className="font-extrabold text-navy-dark">{project.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-gray/15 overflow-hidden">
              <div className="h-full bg-ashas-blue rounded-full transition-all" style={{ width: `${Math.min(100, project.progress)}%` }} />
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {[0, 25, 50, 75, 100].map((v) => (
                <button key={v} onClick={() => updateProject(id, { progress: v })}
                  className={`text-xs font-bold px-2 py-1 rounded transition-colors ${project.progress === v ? "bg-navy-dark text-off-white" : "text-slate-gray hover:bg-slate-gray/15"}`}>
                  {v}%
                </button>
              ))}
            </div>
          </div>
          {snapshot && <BudgetSummary snapshot={snapshot} />}
        </div>
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-slate-gray/20 bg-white p-5 space-y-4">
            <div className="h-0.5 w-8 bg-cyan-accent rounded-full" />
            <InfoRow label="Deadline Klien" value={
              deadline ? (
                <span className={days !== null && days < 0 ? "text-rose-600 font-bold" : ""}>
                  {formatDate(deadline)}
                  {days !== null && days >= 0 && <span className="ml-1 text-slate-gray font-normal">({days}h)</span>}
                  {days !== null && days < 0 && <span className="ml-1 font-bold"> (-{Math.abs(days)}h)</span>}
                </span>
              ) : "—"
            } />
            <InfoRow label="Budget" value={project.budget ? formatIDR(project.budget) : "—"} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["planning", "in-progress", "review", "completed", "on-hold"] as const).map((s) => (
              <button key={s} onClick={() => updateProject(id, { status: s })}
                className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border ${project.status === s ? "bg-navy-dark text-off-white border-navy-dark" : "border-slate-gray/30 text-slate-gray hover:border-navy-dark"}`}>
                {projectStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PROGRESS TIMELINE */}
      <section className="mb-16">
        <SectionTitle title="Progress Timeline" description="Riwayat aktivitas project — meeting, task selesai, transaksi, revisi, log harian" />
        {timeline.length === 0 ? (
          <EmptyState title="Belum ada aktivitas" description="Mulai isi tracker harian atau catat meeting untuk membangun riwayat." />
        ) : (
          <div className="rounded-lg border border-slate-gray/20 bg-white p-8">
            <ol className="relative border-l-2 border-slate-gray/15 ml-3 space-y-5">
              {timeline.map((e, i) => (
                <li key={i} className="pl-8 relative">
                  <span className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white ${DOT_COLOR[e.type]}`} />
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">{formatDate(e.date)}</div>
                  <div className="text-sm font-bold text-navy-dark mt-0.5 break-words">{e.label}</div>
                  {e.detail && <div className="text-xs text-slate-gray mt-0.5 break-words">{e.detail}</div>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* REVIEW HARIAN */}
      <section className="mb-16">
        <SectionTitle
          title={`Review Harian — ${formatDate(today)}`}
          description="Ringkasan apa yang sudah dikerjakan dan yang masih harus diselesaikan hari ini"
          action={allLogs.length > 0 ? (
            <button onClick={() => setShowAllLogs(!showAllLogs)} className="text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark">
              {showAllLogs ? "Tutup riwayat" : `Riwayat (${allLogs.length})`}
            </button>
          ) : undefined}
        />

        {showAllLogs ? (
          <div className="rounded-lg border border-slate-gray/20 bg-white p-6 space-y-5">
            {logsByDate.map(([date, logs]) => (
              <div key={date}>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mb-2">{date === today ? "Hari ini" : formatDate(date)}</div>
                <ul className="space-y-1.5">
                  {logs.map((l) => (
                    <li key={l.id} className="group flex items-start gap-3 rounded-md bg-off-white px-4 py-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-accent" />
                      <span className="flex-1 text-sm text-navy-dark break-words">{l.note}</span>
                      <button onClick={() => deleteDailyLog(l.id)} className="opacity-0 group-hover:opacity-100 shrink-0 text-xs text-slate-gray hover:text-rose-600">×</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Belum selesai */}
            <div className="rounded-lg border border-slate-gray/20 bg-white">
              <div className="px-5 py-3.5 border-b border-slate-gray/15 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /><h3 className="text-sm font-bold text-navy-dark uppercase tracking-wider">Belum Selesai</h3></div>
                <span className="text-xs font-bold text-slate-gray">{projectTasks.filter(t => t.status !== "done").length + projectRevisions.filter(r => r.status !== "done").length} item</span>
              </div>
              <div className="p-4">
                {projectTasks.filter(t => t.status !== "done").length === 0 && projectRevisions.filter(r => r.status !== "done").length === 0 ? (
                  <p className="text-sm text-slate-gray text-center py-6">Semua sudah selesai hari ini! 🎉</p>
                ) : (
                  <div className="space-y-1">
                    {projectTasks.filter(t => t.status !== "done").map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-off-white">
                        <button onClick={() => updateTask(t.id, { status: "done" })} className="shrink-0 h-[18px] w-[18px] rounded border-2 border-slate-gray/50 hover:border-navy-dark transition-colors" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-navy-dark">{t.title}</span>
                          <div className="flex items-center gap-1.5 mt-0.5"><span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[t.priority]}`} /><span className="text-[10px] text-slate-gray uppercase font-bold">Task</span></div>
                        </div>
                      </div>
                    ))}
                    {projectRevisions.filter(r => r.status !== "done").map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-off-white">
                        <button onClick={() => updateRevision(r.id, { status: "done", completedDate: today })} className="shrink-0 h-[18px] w-[18px] rounded border-2 border-amber-400/60 hover:border-amber-500 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-navy-dark">{r.title}</span>
                          <div className="mt-0.5"><span className="text-[10px] text-amber-600 uppercase font-bold">Revisi</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Sudah dikerjakan */}
            <div className="rounded-lg border border-slate-gray/20 bg-white">
              <div className="px-5 py-3.5 border-b border-slate-gray/15"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-accent" /><h3 className="text-sm font-bold text-navy-dark uppercase tracking-wider">Sudah Dikerjakan</h3></div></div>
              <div className="p-4">
                <div className="flex gap-2 mb-4">
                  <input ref={logInputRef} value={logInput} onChange={(e) => setLogInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitLog(); }}
                    placeholder="Tulis catatan… (Enter)"
                    className="flex-1 rounded-md border border-slate-gray/30 bg-off-white px-3 py-2 text-sm placeholder:text-slate-gray focus:border-ashas-blue focus:outline-none" />
                  <button onClick={submitLog} disabled={!logInput.trim()} className="shrink-0 rounded-md bg-navy-dark text-off-white px-3 py-2 text-xs font-bold disabled:opacity-40 hover:bg-ashas-blue transition-colors">+ Catat</button>
                </div>
                {todayLogs.length === 0 && projectTasks.filter(t => t.status === "done").length === 0 && projectRevisions.filter(r => r.status === "done" && r.completedDate === today).length === 0 ? (
                  <p className="text-sm text-slate-gray text-center py-4">Belum ada yang dicatat.</p>
                ) : (
                  <div className="space-y-1">
                    {todayLogs.map((l) => (
                      <div key={l.id} className="group flex items-start gap-3 rounded-md px-3 py-2.5 bg-cyan-accent/5 border border-cyan-accent/20">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-accent" />
                        <span className="flex-1 text-sm text-navy-dark break-words">{l.note}</span>
                        <button onClick={() => deleteDailyLog(l.id)} className="opacity-0 group-hover:opacity-100 text-xs text-slate-gray hover:text-rose-600">×</button>
                      </div>
                    ))}
                    {projectTasks.filter(t => t.status === "done").map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-md px-3 py-2.5 bg-emerald-50/50 border border-emerald-100">
                        <svg className="h-3.5 w-3.5 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                        <span className="flex-1 text-sm text-slate-gray line-through">{t.title}</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Task</span>
                      </div>
                    ))}
                    {projectRevisions.filter(r => r.status === "done" && r.completedDate === today).map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-md px-3 py-2.5 bg-emerald-50/50 border border-emerald-100">
                        <svg className="h-3.5 w-3.5 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                        <span className="flex-1 text-sm text-slate-gray line-through">{r.title}</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Revisi</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* REVISI */}
      <section className="mb-16">
        <SectionTitle
          title="Daftar Revisi"
          description={`${projectRevisions.filter(r => r.status === "done").length} / ${projectRevisions.length} selesai`}
          action={<Button onClick={() => setRevModalOpen(true)}>+ Tambah Revisi</Button>}
        />
        {projectRevisions.length === 0 ? (
          <EmptyState title="Belum ada revisi" description="Tambahkan daftar permintaan revisi dari klien." action={<Button onClick={() => setRevModalOpen(true)}>+ Tambah Revisi</Button>} />
        ) : (
          <div className="rounded-lg border border-slate-gray/20 bg-white divide-y divide-slate-gray/10">
            {projectRevisions.map((r) => {
              const done = r.status === "done";
              return (
                <div key={r.id} className="group flex items-start gap-4 px-6 py-4">
                  <button onClick={() => updateRevision(r.id, { status: done ? "requested" : "done", completedDate: done ? undefined : today })}
                    className={`mt-0.5 shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${done ? "border-cyan-accent bg-cyan-accent text-navy-dark" : "border-slate-gray/50 hover:border-navy-dark"}`}>
                    {done && <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className={`text-sm font-bold break-words ${done ? "line-through text-slate-gray" : "text-navy-dark"}`}>{r.title}</p>
                    {r.description && <p className="text-xs text-slate-gray mt-0.5 break-words">{r.description}</p>}
                    {done && r.completedDate && <p className="text-xs text-cyan-accent mt-0.5">✓ Selesai {formatDate(r.completedDate)}</p>}
                  </div>
                  <button onClick={() => { if (confirm("Hapus revisi ini?")) deleteRevision(r.id); }}
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-opacity">Hapus</button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TASK LIST */}
      <section className="mb-16">
        <SectionTitle
          title="Task List"
          description={`${projectTasks.filter(t => t.status === "done").length} / ${projectTasks.length} selesai`}
          action={<Button onClick={() => setTaskModalOpen(true)}>+ Tambah Task</Button>}
        />
        {projectTasks.length === 0 ? (
          <EmptyState title="Belum ada task" description="Pecah project ini menjadi task-task kecil." action={<Button onClick={() => setTaskModalOpen(true)}>+ Tambah Task</Button>} />
        ) : (
          <div className="rounded-lg border border-slate-gray/20 bg-white divide-y divide-slate-gray/10">
            {projectTasks.map((t) => {
              const done = t.status === "done";
              const overdue = !done && daysUntil(t.dueDate) !== null && daysUntil(t.dueDate)! < 0;
              return (
                <div key={t.id} className="group flex items-start gap-4 px-6 py-4">
                  <button onClick={() => updateTask(t.id, { status: done ? "todo" : "done" })}
                    className={`mt-0.5 shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-gray/50 hover:border-navy-dark"}`}>
                    {done && <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[t.priority]}`} />
                      <p className={`text-sm font-bold break-words ${done ? "line-through text-slate-gray" : "text-navy-dark"}`}>{t.title}</p>
                    </div>
                    {editingTaskId === t.id ? (
                      <div className="mt-2 ml-4 flex flex-wrap items-center gap-2">
                        <select value={taskEditForm.priority} onChange={(e) => setTaskEditForm({ ...taskEditForm, priority: e.target.value as TaskPriority })}
                          className="text-xs rounded border border-slate-gray/40 bg-white px-2 py-1 focus:outline-none">
                          <option value="high">● Tinggi</option>
                          <option value="medium">● Sedang</option>
                          <option value="low">● Rendah</option>
                        </select>
                        <input type="date" value={taskEditForm.dueDate} onChange={(e) => setTaskEditForm({ ...taskEditForm, dueDate: e.target.value })}
                          className="text-xs rounded border border-slate-gray/40 bg-white px-2 py-1 focus:outline-none" />
                        <button onClick={saveTaskEdit} className="text-xs font-bold text-ashas-blue hover:text-navy-dark px-2 py-1 rounded bg-ashas-blue/10">Simpan</button>
                        <button onClick={() => setEditingTaskId(null)} className="text-xs text-slate-gray px-1 py-1">Batal</button>
                      </div>
                    ) : (
                      t.dueDate && (
                        <p className={`text-xs mt-0.5 ml-4 font-bold ${overdue ? "text-rose-600" : "text-slate-gray"}`}>
                          {overdue ? `Terlambat ${Math.abs(daysUntil(t.dueDate)!)} hari` : formatDate(t.dueDate)}
                        </p>
                      )
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openTaskEdit(t)} className="text-xs font-bold text-slate-gray hover:text-navy-dark px-2 py-1 rounded hover:bg-off-white">Edit</button>
                    <button onClick={() => { if (confirm("Hapus task ini?")) deleteTask(t.id); }} className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50">Hapus</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MEETING NOTES */}
      <section className="mb-16">
        <SectionTitle title="Meeting Notes" description="Catatan diskusi dan keputusan dari pertemuan terkait project ini"
          action={client ? <Button onClick={openCreateMeeting}>+ Catatan Baru</Button> : undefined} />
        {!client ? (
          <EmptyState title="Project belum punya klien" description="Hubungkan project ke klien untuk mencatat meeting." />
        ) : projectMeetings.length === 0 ? (
          <EmptyState title="Belum ada catatan meeting" description="Tambahkan catatan dari diskusi dengan klien." action={<Button onClick={openCreateMeeting}>+ Catatan Baru</Button>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectMeetings.map((m) => (
              <div key={m.id} className="group rounded-lg border border-slate-gray/20 bg-white p-6">
                <div className="mb-3">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-cyan-accent">{formatDate(m.date)}</div>
                  <h3 className="text-base font-bold text-navy-dark mt-1">{m.title}</h3>
                </div>
                <p className="text-sm text-navy-dark/80 whitespace-pre-wrap break-words">{m.content}</p>
                <div className="mt-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditMeeting(m)} className="text-xs font-bold text-slate-gray hover:text-navy-dark px-2 py-1 rounded hover:bg-off-white">Edit</button>
                  <button onClick={() => { if (confirm("Hapus catatan ini?")) deleteMeetingNote(m.id); }} className="text-xs font-bold text-rose-600 px-2 py-1 rounded hover:bg-rose-50">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TRANSAKSI */}
      <section className="mb-16">
        <SectionTitle
          title="Pemasukan & Pengeluaran"
          description="Catat semua transaksi keuangan terkait project ini"
          action={<div className="flex gap-2"><Button onClick={() => openTx("income")}>+ Pemasukan</Button><Button variant="secondary" onClick={() => openTx("expense")}>− Pengeluaran</Button></div>}
        />
        {projectTransactions.length === 0 ? (
          <EmptyState title="Belum ada transaksi" description="Catat DP, cicilan, biaya, atau pengeluaran terkait project ini."
            action={<div className="flex gap-2 justify-center"><Button onClick={() => openTx("income")}>+ Pemasukan</Button><Button variant="secondary" onClick={() => openTx("expense")}>− Pengeluaran</Button></div>} />
        ) : (
          <div className="rounded-lg border border-slate-gray/20 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider font-bold text-slate-gray border-b border-slate-gray/15 bg-off-white">
                  <th className="px-6 py-3">Tanggal</th><th className="px-6 py-3">Deskripsi</th>
                  <th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-gray/10">
                {projectTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-off-white">
                    <td className="px-6 py-4 text-slate-gray whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-6 py-4 text-navy-dark font-bold">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${t.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : t.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                        {t.status === "paid" ? "Lunas" : t.status === "pending" ? "Pending" : "Terlambat"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-extrabold whitespace-nowrap ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.type === "income" ? "+" : "−"} {formatIDR(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODALS */}
      <Modal open={txModalOpen} onClose={() => setTxModalOpen(false)}
        title={txForm.type === "income" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
        footer={<><Button variant="secondary" onClick={() => setTxModalOpen(false)}>Batal</Button><Button onClick={submitTx}>Tambah</Button></>}>
        <div className="space-y-4">
          <div className={`rounded-md px-4 py-3 text-sm font-bold border ${txForm.type === "income" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
            {txForm.type === "income" ? "+ Pemasukan untuk project ini" : "− Pengeluaran dari budget project ini"}
          </div>
          <Field label="Deskripsi *"><Input value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} placeholder={txForm.type === "income" ? "Contoh: DP 50%…" : "Contoh: Hosting, Domain…"} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jumlah (IDR) *"><Input type="number" min={0} value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} /></Field>
            <Field label="Tanggal"><Input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} /></Field>
          </div>
          <Field label="Status">
            <Select value={txForm.status} onChange={(e) => setTxForm({ ...txForm, status: e.target.value as TransactionStatus })}>
              {txForm.type === "income" ? <><option value="pending">Pending</option><option value="paid">Lunas</option><option value="overdue">Terlambat</option></> : <><option value="paid">Sudah dibayar</option><option value="pending">Belum dibayar</option></>}
            </Select>
          </Field>
          {snapshot && txForm.type === "expense" && txForm.amount && snapshot.budget !== undefined && (
            <div className="rounded-md border border-slate-gray/20 bg-off-white px-4 py-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mb-2">Dampak ke Budget</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div><div className="text-slate-gray font-bold">Budget</div><div className="font-extrabold text-navy-dark mt-0.5">{formatIDR(snapshot.budget)}</div></div>
                <div><div className="text-slate-gray font-bold">Sudah Keluar</div><div className="font-extrabold text-rose-600 mt-0.5">−{formatIDR(snapshot.expensesCommitted)}</div></div>
                <div><div className="text-slate-gray font-bold">Sisa Setelah</div>
                  <div className={`font-extrabold mt-0.5 ${snapshot.budget - snapshot.expensesCommitted - Number(txForm.amount) < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {formatIDR(snapshot.budget - snapshot.expensesCommitted - Number(txForm.amount))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={revModalOpen} onClose={() => setRevModalOpen(false)} title="Tambah Revisi"
        footer={<><Button variant="secondary" onClick={() => setRevModalOpen(false)}>Batal</Button><Button onClick={submitRevisions}>Tambah Semua</Button></>}>
        <div className="space-y-4">
          <div className="rounded-md bg-cyan-accent/10 border border-cyan-accent/30 px-4 py-3 text-sm text-navy-dark"><strong>Tulis satu revisi per baris.</strong></div>
          <Field label="Daftar revisi (satu per baris) *">
            <Textarea value={revBulk} onChange={(e) => setRevBulk(e.target.value)}
              placeholder={"Ganti warna tombol\nTambah section testimoni\nPerbaiki mobile"} className="min-h-[140px] font-mono text-sm" autoFocus />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer rounded-md border border-slate-gray/30 px-4 py-3 hover:bg-off-white transition-colors">
            <input type="checkbox" checked={revCreateTask} onChange={(e) => setRevCreateTask(e.target.checked)} className="h-4 w-4 accent-ashas-blue" />
            <div><div className="text-sm font-bold text-navy-dark">Buat task untuk setiap revisi</div><div className="text-xs text-slate-gray">Setiap baris juga masuk ke Task List</div></div>
          </label>
          <p className="text-xs text-slate-gray">{revBulk.split("\n").filter((l) => l.trim()).length} revisi akan dibuat{revCreateTask ? " + task" : ""}</p>
        </div>
      </Modal>

      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Tambah Task"
        footer={<><Button variant="secondary" onClick={() => setTaskModalOpen(false)}>Batal</Button><Button onClick={submitTasks}>Tambah Semua</Button></>}>
        <div className="space-y-4">
          <div className="rounded-md bg-off-white border border-slate-gray/20 px-4 py-3 text-sm text-navy-dark">Tulis satu task per baris.</div>
          <Field label="Daftar task (satu per baris) *">
            <Textarea value={taskBulk} onChange={(e) => setTaskBulk(e.target.value)}
              placeholder={"Buat wireframe\nDesign mockup\nIntegrasi payment"} className="min-h-[140px] font-mono text-sm" autoFocus />
          </Field>
          <Field label="Prioritas">
            <div className="flex gap-2">
              {(["high", "medium", "low"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setTaskPriority(p)}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${taskPriority === p ? "bg-navy-dark text-off-white border-navy-dark" : "border-slate-gray/30 text-slate-gray hover:bg-off-white"}`}>
                  <span className={`inline-block h-2 w-2 rounded-full mr-2 ${PRIORITY_DOT[p]}`} />
                  {p === "high" ? "Tinggi" : p === "medium" ? "Sedang" : "Rendah"}
                </button>
              ))}
            </div>
          </Field>
          <p className="text-xs text-slate-gray">{taskBulk.split("\n").filter((l) => l.trim()).length} task akan dibuat</p>
        </div>
      </Modal>

      <Modal open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)} title={editingMeetingId ? "Edit Catatan" : "Catatan Meeting Baru"}
        footer={<><Button variant="secondary" onClick={() => setMeetingModalOpen(false)}>Batal</Button><Button onClick={submitMeeting}>{editingMeetingId ? "Simpan" : "Tambah"}</Button></>}>
        <div className="space-y-4">
          <Field label="Judul *"><Input value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="Contoh: Kickoff meeting, Review wireframe…" autoFocus /></Field>
          <Field label="Tanggal"><Input type="date" value={meetingForm.date} onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })} /></Field>
          <Field label="Catatan diskusi"><Textarea value={meetingForm.content} onChange={(e) => setMeetingForm({ ...meetingForm, content: e.target.value })} placeholder="Poin-poin penting, keputusan, action items…" className="min-h-[140px]" /></Field>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mb-1">{label}</div>
      <div className="text-sm font-bold text-navy-dark break-words">{value}</div>
    </div>
  );
}
