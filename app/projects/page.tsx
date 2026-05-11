"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDashboard } from "../_components/DashboardProvider";
import PageHeader from "../_components/PageHeader";
import Button from "../_components/Button";
import Badge from "../_components/Badge";
import Modal from "../_components/Modal";
import EmptyState from "../_components/EmptyState";
import { Field, Input, Select, Textarea } from "../_components/FormField";
import { projectStatusLabel, projectStatusTone } from "../_lib/labels";
import type { Project, ProjectStatus } from "../_lib/types";
import { daysUntil, formatDate, formatIDR } from "../_lib/format";
import {
  getProjectBudgetSnapshot,
  getProjectDeadline,
} from "../_lib/derived";
import BudgetSummary from "../_components/BudgetSummary";
import { getClientColor } from "../_lib/colors";

type FormState = {
  name: string;
  clientId: string;
  description: string;
  status: ProjectStatus;
  budget: string;
  progress: string;
};

const emptyForm: FormState = {
  name: "",
  clientId: "",
  description: "",
  status: "planning",
  budget: "",
  progress: "0",
};

export default function ProjectsPage() {
  const { data, addProject, updateProject, deleteProject, duplicateProject } = useDashboard();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      const client = data.clients.find((c) => c.id === p.clientId);
      return [p.name, p.description, client?.name, client?.company]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [data.projects, data.clients, query, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      clientId: p.clientId ?? "",
      description: p.description ?? "",
      status: p.status,
      budget: p.budget ? String(p.budget) : "",
      progress: String(p.progress ?? 0),
    });
    setModalOpen(true);
  }

  function submit() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      clientId: form.clientId || undefined,
      description: form.description.trim() || undefined,
      status: form.status,
      budget: form.budget ? Number(form.budget) : undefined,
      progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
    };
    if (editingId) {
      updateProject(editingId, payload);
    } else {
      addProject(payload);
    }
    setModalOpen(false);
  }

  function remove(id: string) {
    if (
      confirm(
        "Hapus project ini? Task & transaksi terkait akan dilepas dari project.",
      )
    )
      deleteProject(id);
  }

  const counts = {
    all: data.projects.length,
    planning: data.projects.filter((p) => p.status === "planning").length,
    "in-progress": data.projects.filter((p) => p.status === "in-progress")
      .length,
    review: data.projects.filter((p) => p.status === "review").length,
    completed: data.projects.filter((p) => p.status === "completed").length,
  };

  const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "planning", label: "Perencanaan" },
    { value: "in-progress", label: "Berjalan" },
    { value: "review", label: "Review" },
    { value: "completed", label: "Selesai" },
  ];

  return (
    <div>
      <PageHeader
        title="Project"
        description="Lacak progress dan budget tiap project. Deadline mengikuti klien terkait."
        action={<Button onClick={openCreate}>+ Tambah Project</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari project, klien…"
          className="flex-1 rounded-md border border-slate-gray/40 bg-white px-3.5 py-2.5 text-sm placeholder:text-slate-gray focus:border-ashas-blue focus:outline-none focus:ring-2 focus:ring-ashas-blue/20"
        />
        <div className="flex flex-wrap gap-1 rounded-md border border-slate-gray/20 bg-white p-1">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === s.value
                  ? "bg-navy-dark text-off-white"
                  : "text-slate-gray hover:bg-off-white"
              }`}
            >
              {s.label}
              <span className="ml-1.5 opacity-60">
                {counts[s.value as keyof typeof counts] ?? ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada project"
          description={
            query || statusFilter !== "all"
              ? "Tidak ada project yang cocok dengan filter."
              : "Mulai tambahkan project pertama Anda."
          }
          action={
            !query && statusFilter === "all" ? (
              <Button onClick={openCreate}>+ Tambah Project</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => {
            const client = data.clients.find((c) => c.id === p.clientId);
            const deadline = getProjectDeadline(p, data.clients);
            const days = daysUntil(deadline);
            const snapshot = getProjectBudgetSnapshot(p, data.transactions);
            const hasMoney =
              p.budget !== undefined ||
              snapshot.incomePaid > 0 ||
              snapshot.expensesPaid > 0;
            const color = getClientColor(p.clientId, data.clients);
            return (
              <div
                key={p.id}
                className="group relative flex rounded-lg border border-slate-gray/20 overflow-hidden hover:border-ashas-blue/50 transition-colors"
              >
                <Link href={`/projects/${p.id}`} className="absolute inset-0 z-0" aria-label={`Detail ${p.name}`} />
                {/* Client color stripe */}
                <div
                  className="w-1.5 shrink-0"
                  style={{ background: color.accent }}
                />

                {/* Card body */}
                <div
                  className="flex-1 p-7"
                  style={{ backgroundColor: color.light }}
                >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-navy-dark">{p.name}</h3>
                      <Badge tone={projectStatusTone(p.status)}>
                        {projectStatusLabel(p.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-gray mt-1.5">
                      {client ? (
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-bold hover:underline"
                          style={{ color: color.accent }}
                        >
                          {client.name}
                          {client.company && (
                            <span className="font-normal text-slate-gray">
                              {" "}· {client.company}
                            </span>
                          )}
                        </Link>
                      ) : (
                        "Tanpa klien"
                      )}
                    </p>
                  </div>
                </div>

                {p.description && (
                  <p className="mt-4 text-sm text-slate-gray line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">
                      Progress
                    </span>
                    <span className="font-extrabold text-navy-dark text-sm">
                      {p.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-gray/15">
                    <div
                      className="h-full bg-ashas-blue rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, p.progress))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">
                      Deadline Klien
                    </div>
                    <div className="font-bold text-navy-dark mt-1">
                      {deadline ? (
                        <>
                          {formatDate(deadline)}
                          {days !== null && days >= 0 && (
                            <span className="ml-1 text-slate-gray font-normal">
                              ({days}h)
                            </span>
                          )}
                          {days !== null &&
                            days < 0 &&
                            p.status !== "completed" && (
                              <span className="ml-1 text-rose-600">
                                (-{Math.abs(days)}h)
                              </span>
                            )}
                        </>
                      ) : (
                        <span className="text-slate-gray font-normal">—</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">
                      Budget
                    </div>
                    <div className="font-bold text-navy-dark mt-1">
                      {p.budget ? formatIDR(p.budget) : "-"}
                    </div>
                  </div>
                </div>

                {hasMoney && (
                  <div className="mt-4">
                    <BudgetSummary snapshot={snapshot} variant="compact" />
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-accent">
                    Lihat detail →
                  </span>
                  <div className="relative z-10 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="text-xs font-bold text-ashas-blue hover:text-navy-dark px-2 py-1 rounded hover:bg-off-white"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); duplicateProject(p.id); }}
                    >
                      Duplikasi
                    </button>
                    <button
                      className="text-xs font-bold text-slate-gray hover:text-navy-dark px-2 py-1 rounded hover:bg-off-white"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(p); }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(p.id); }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Project" : "Tambah Project"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={submit}>{editingId ? "Simpan" : "Tambah"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama project *">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Redesign Website Klien A"
              autoFocus
            />
          </Field>
          <Field
            label="Klien"
            hint="Deadline project mengikuti deadline klien yang dipilih."
          >
            <Select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <option value="">— Tanpa klien —</option>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ""}
                  {c.deadline ? ` · deadline ${formatDate(c.deadline)}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Deskripsi">
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Scope project, brief, dll."
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ProjectStatus })
                }
              >
                <option value="planning">Perencanaan</option>
                <option value="in-progress">Berjalan</option>
                <option value="review">Review</option>
                <option value="completed">Selesai</option>
                <option value="on-hold">Ditunda</option>
              </Select>
            </Field>
            <Field label="Progress (%)">
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label="Budget (IDR)"
            hint="Setiap pengeluaran yang dicatat ke project ini akan mengurangi sisa budget."
          >
            <Input
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="10000000"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
