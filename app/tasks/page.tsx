"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDashboard } from "../_components/DashboardProvider";
import PageHeader from "../_components/PageHeader";
import { daysUntil, formatDate } from "../_lib/format";
import { getClientColor } from "../_lib/colors";
import { taskPriorityLabel, taskStatusLabel } from "../_lib/labels";
import type { TaskPriority, TaskStatus, RevisionStatus } from "../_lib/types";

type ItemKind = "task" | "revision";
type FilterType = "all" | "task" | "revision";
type FilterStatus = "all" | "pending" | "done";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-slate-gray",
};

const STATUS_COLOR: Record<string, string> = {
  todo: "bg-slate-gray/15 text-slate-gray border-slate-gray/30",
  "in-progress": "bg-ashas-blue/15 text-ashas-blue border-ashas-blue/30",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  requested_done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function TasksPage() {
  const { data, updateTask, updateRevision } = useDashboard();
  const today = todayISO();

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterProject, setFilterProject] = useState<string>("all");

  // Build combined list
  type Combined = {
    id: string;
    kind: ItemKind;
    title: string;
    isDone: boolean;
    status: string;
    priority?: TaskPriority;
    dueDate?: string;
    projectId?: string;
    projectName?: string;
    clientId?: string;
    accent: string;
    light: string;
  };

  const combined = useMemo<Combined[]>(() => {
    const items: Combined[] = [];

    for (const t of data.tasks) {
      const project = data.projects.find((p) => p.id === t.projectId);
      const col = getClientColor(project?.clientId, data.clients);
      items.push({
        id: t.id,
        kind: "task",
        title: t.title,
        isDone: t.status === "done",
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        projectId: t.projectId,
        projectName: project?.name,
        clientId: project?.clientId,
        accent: col.accent,
        light: col.light,
      });
    }

    for (const r of data.revisions) {
      const project = data.projects.find((p) => p.id === r.projectId);
      const col = getClientColor(project?.clientId, data.clients);
      items.push({
        id: r.id,
        kind: "revision",
        title: r.title,
        isDone: r.status === "done",
        status: r.status === "done" ? "done" : r.status,
        dueDate: r.requestedDate,
        projectId: r.projectId,
        projectName: project?.name,
        clientId: project?.clientId,
        accent: col.accent,
        light: col.light,
      });
    }

    return items.sort((a, b) => {
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [data.tasks, data.revisions, data.projects, data.clients]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return combined.filter((item) => {
      if (filterType !== "all" && item.kind !== filterType) return false;
      if (filterStatus === "pending" && item.isDone) return false;
      if (filterStatus === "done" && !item.isDone) return false;
      if (filterProject !== "all" && item.projectId !== filterProject) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.projectName?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [combined, query, filterType, filterStatus, filterProject]);

  const stats = {
    total: combined.length,
    pending: combined.filter((i) => !i.isDone).length,
    overdue: combined.filter((i) => !i.isDone && daysUntil(i.dueDate) !== null && daysUntil(i.dueDate)! < 0).length,
    done: combined.filter((i) => i.isDone).length,
  };

  function toggle(item: Combined) {
    if (item.kind === "task") {
      updateTask(item.id, { status: item.isDone ? "todo" : "done" });
    } else {
      updateRevision(item.id, { status: item.isDone ? "requested" : "done", completedDate: item.isDone ? undefined : today });
    }
  }

  const allProjects = data.projects.filter((p) =>
    combined.some((i) => i.projectId === p.id),
  );

  return (
    <div>
      <PageHeader
        title="Tugas & Revisi"
        description="Database seluruh task dan revisi dari semua project — diurutkan berdasarkan deadline"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, tone: "default" },
          { label: "Belum Selesai", value: stats.pending, tone: "warning" },
          { label: "Terlambat", value: stats.overdue, tone: "danger" },
          { label: "Selesai", value: stats.done, tone: "positive" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-gray/20 bg-white p-5">
            <div className="h-0.5 w-6 bg-cyan-accent rounded-full mb-3" />
            <div className={`text-2xl font-extrabold ${s.tone === "danger" ? "text-rose-600" : s.tone === "warning" ? "text-amber-600" : s.tone === "positive" ? "text-emerald-600" : "text-navy-dark"}`}>
              {s.value}
            </div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari judul, project…"
          className="flex-1 min-w-[200px] rounded-md border border-slate-gray/40 bg-white px-3.5 py-2.5 text-sm placeholder:text-slate-gray focus:border-ashas-blue focus:outline-none focus:ring-2 focus:ring-ashas-blue/20" />

        <div className="flex gap-1 rounded-md border border-slate-gray/20 bg-white p-1">
          {([["all", "Semua"], ["task", "Task"], ["revision", "Revisi"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilterType(v)}
              className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${filterType === v ? "bg-navy-dark text-off-white" : "text-slate-gray hover:bg-off-white"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-md border border-slate-gray/20 bg-white p-1">
          {([["all", "Semua"], ["pending", "Pending"], ["done", "Selesai"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${filterStatus === v ? "bg-navy-dark text-off-white" : "text-slate-gray hover:bg-off-white"}`}>
              {l}
            </button>
          ))}
        </div>

        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}
          className="rounded-md border border-slate-gray/40 bg-white px-3 py-2 text-sm text-navy-dark focus:border-ashas-blue focus:outline-none">
          <option value="all">Semua Project</option>
          {allProjects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs font-bold text-slate-gray">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-ashas-blue/30 bg-ashas-blue/15" />
          Task biasa
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-amber-200 bg-amber-50" />
          Revisi dari klien
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-1 rounded-full bg-rose-500" />
          Prioritas Tinggi
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-1 rounded-full bg-amber-400" />
          Prioritas Sedang
        </div>
        <div className="text-slate-gray/60 italic">Stripe kiri = warna project/klien</div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-gray/40 bg-white py-16 text-center">
          <p className="text-sm text-slate-gray font-bold">Tidak ada item yang cocok dengan filter.</p>
          <p className="text-xs text-slate-gray mt-1">Coba ubah filter atau tambah task/revisi dari halaman Project.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-gray/20 overflow-hidden">
          {filtered.map((item, i) => {
            const days = daysUntil(item.dueDate);
            const overdue = !item.isDone && days !== null && days < 0;
            const isRevision = item.kind === "revision";
            return (
              <div key={`${item.kind}-${item.id}`}
                className={`flex items-start gap-0 ${i > 0 ? "border-t border-slate-gray/10" : ""} ${item.isDone ? "opacity-60" : ""}`}
                style={{ backgroundColor: item.light }}>
                {/* Project color stripe */}
                <div className="w-1 shrink-0 self-stretch" style={{ background: item.accent }} />

                <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggle(item)}
                    className={`mt-0.5 shrink-0 h-4.5 h-[18px] w-[18px] rounded border-2 flex items-center justify-center transition-colors ${
                      item.isDone
                        ? isRevision
                          ? "border-cyan-accent bg-cyan-accent text-navy-dark"
                          : "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-gray/50 hover:border-navy-dark bg-white"
                    }`}
                  >
                    {item.isDone && (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start flex-wrap gap-2">
                      <span className={`text-sm font-bold break-words ${item.isDone ? "line-through text-slate-gray" : "text-navy-dark"}`}>
                        {item.title}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {/* Type badge */}
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isRevision
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-ashas-blue/10 text-ashas-blue border-ashas-blue/20"
                      }`}>
                        {isRevision ? "Revisi" : "Task"}
                      </span>

                      {/* Priority dot (tasks only) */}
                      {item.priority && !isRevision && (
                        <span className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[item.priority]}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-gray">
                            {taskPriorityLabel(item.priority)}
                          </span>
                        </span>
                      )}

                      {/* Status */}
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[item.status] ?? STATUS_COLOR.todo}`}>
                        {isRevision
                          ? item.isDone ? "Selesai" : item.status === "in-progress" ? "Dikerjakan" : "Diminta"
                          : taskStatusLabel(item.status as TaskStatus)
                        }
                      </span>

                      {/* Project link */}
                      {item.projectId && item.projectName && (
                        <Link href={`/projects/${item.projectId}`}
                          className="text-[10px] font-bold text-slate-gray hover:text-navy-dark truncate max-w-[160px]"
                          style={{ color: item.accent }}>
                          {item.projectName}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Due date */}
                  <div className="shrink-0 text-right text-xs">
                    {item.dueDate ? (
                      <span className={`font-bold ${overdue ? "text-rose-600" : days === 0 ? "text-amber-600" : "text-slate-gray"}`}>
                        {overdue ? `−${Math.abs(days!)}h` : days === 0 ? "Hari ini" : days === 1 ? "Besok" : formatDate(item.dueDate)}
                      </span>
                    ) : (
                      <span className="text-slate-gray/40">—</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-gray text-center mt-4">
        Tambah task atau revisi baru dari halaman detail project masing-masing.
      </p>
    </div>
  );
}
