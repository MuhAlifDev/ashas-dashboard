"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDashboard } from "../../_components/DashboardProvider";
import PageHeader from "../../_components/PageHeader";
import SectionTitle from "../../_components/SectionTitle";
import Button from "../../_components/Button";
import Badge from "../../_components/Badge";
import StatCard from "../../_components/StatCard";
import Modal from "../../_components/Modal";
import EmptyState from "../../_components/EmptyState";
import BudgetSummary from "../../_components/BudgetSummary";
import { Field, Input, Select, Textarea } from "../../_components/FormField";
import {
  clientStatusLabel,
  clientStatusTone,
  projectStatusLabel,
  projectStatusTone,
} from "../../_lib/labels";
import { daysUntil, formatDate, formatIDR } from "../../_lib/format";
import {
  getProjectBudgetSnapshot,
  rollupBudgetSnapshots,
} from "../../_lib/derived";
import type { ClientStatus } from "../../_lib/types";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data, updateClient, deleteClient } = useDashboard();

  const client = data.clients.find((c) => c.id === id);

  // Last contact = most recent meeting note date
  const lastContact = useMemo(() => {
    const meetings = data.meetingNotes
      .filter((m) => m.clientId === id && !m.title.startsWith("Status:"))
      .sort((a, b) => b.date.localeCompare(a.date));
    return meetings[0]?.date ?? null;
  }, [data.meetingNotes, id]);

  // Status history = meeting notes with title starting with "Status:"
  const statusHistory = useMemo(() =>
    data.meetingNotes
      .filter((m) => m.clientId === id && m.title.startsWith("Status:"))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10),
    [data.meetingNotes, id],
  );

  const relatedProjects = useMemo(
    () => data.projects.filter((p) => p.clientId === id),
    [data.projects, id],
  );

  const projectSnapshots = useMemo(
    () => relatedProjects.map((p) => getProjectBudgetSnapshot(p, data.transactions)),
    [relatedProjects, data.transactions],
  );
  const clientRollup = useMemo(
    () => rollupBudgetSnapshots(projectSnapshots),
    [projectSnapshots],
  );

  const totalPending = data.transactions
    .filter((t) => t.clientId === id && t.type === "income" && t.status !== "paid")
    .reduce((s, t) => s + t.amount, 0);
  const avgProgress =
    relatedProjects.length === 0
      ? 0
      : Math.round(relatedProjects.reduce((s, p) => s + p.progress, 0) / relatedProjects.length);

  // ── Edit client modal ─────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "active" as ClientStatus,
    deadline: "",
    notes: "",
    source: "",
  });

  function openEdit() {
    if (!client) return;
    setForm({
      name: client.name,
      company: client.company ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      status: client.status,
      deadline: client.deadline ?? "",
      notes: client.notes ?? "",
      source: client.source ?? "",
    });
    setEditOpen(true);
  }

  async function submitEdit() {
    if (!client || !form.name.trim()) return;
    await updateClient(client.id, {
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      status: form.status,
      deadline: form.deadline || undefined,
      notes: form.notes.trim() || undefined,
      source: form.source.trim() || undefined,
    });
    setEditOpen(false);
  }

  async function handleDelete() {
    if (!client) return;
    if (confirm(`Hapus klien "${client.name}"? Meeting notes & revisions akan ikut terhapus.`)) {
      await deleteClient(client.id);
      router.push("/clients");
    }
  }

  if (!client) {
    return (
      <div>
        <Link href="/clients" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark mb-6">
          ← Kembali ke daftar klien
        </Link>
        <EmptyState
          title="Klien tidak ditemukan"
          description="Klien ini mungkin sudah dihapus."
          action={<Link href="/clients"><Button>Kembali ke daftar klien</Button></Link>}
        />
      </div>
    );
  }

  const days = daysUntil(client.deadline);
  const overdue = days !== null && days < 0;

  return (
    <div>
      <Link href="/clients" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ashas-blue hover:text-navy-dark mb-6">
        ← Kembali ke daftar klien
      </Link>

      <PageHeader
        title={client.name}
        description={client.company}
        action={
          <>
            <Button variant="secondary" onClick={openEdit}>Edit Klien</Button>
            <Button variant="ghost" onClick={handleDelete}>
              <span className="text-rose-600">Hapus</span>
            </Button>
          </>
        }
      />

      {/* INFO + KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
        <div className="lg:col-span-2 rounded-lg border border-slate-gray/20 bg-white p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="block w-1 h-6 bg-cyan-accent rounded-full" />
              <h2 className="text-base font-bold text-navy-dark uppercase tracking-wider">Informasi Klien</h2>
            </div>
            <Badge tone={clientStatusTone(client.status)}>
              {clientStatusLabel(client.status)}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
            <InfoRow label="Nama" value={client.name} />
            <InfoRow label="Perusahaan" value={client.company ?? "—"} />
            <InfoRow label="Email" value={client.email ?? "—"} />
            <InfoRow label="Telepon" value={client.phone ?? "—"} />
            <InfoRow
              label="Deadline"
              value={
                client.deadline ? (
                  <span className={overdue ? "text-rose-600 font-bold" : ""}>
                    {formatDate(client.deadline)}
                    {days !== null && days >= 0 && (
                      <span className="ml-2 text-slate-gray font-normal">({days} hari lagi)</span>
                    )}
                    {overdue && (
                      <span className="ml-2 font-bold"> terlambat {Math.abs(days!)} hari</span>
                    )}
                  </span>
                ) : "—"
              }
            />
            <InfoRow label="Klien sejak" value={formatDate(client.createdAt)} />
            <InfoRow
              label="Terakhir Kontak"
              value={lastContact ? formatDate(lastContact) : <span className="text-slate-gray font-normal">Belum pernah meeting</span>}
            />
            {client.source && (
              <InfoRow label="Referral / Sumber" value={client.source} />
            )}
          </div>
          {statusHistory.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-gray/15">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mb-3">Riwayat Status</div>
              <ol className="space-y-1.5">
                {statusHistory.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 text-xs">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ashas-blue" />
                    <span className="font-bold text-navy-dark">{m.title.replace("Status: ", "")}</span>
                    <span className="text-slate-gray ml-auto">{formatDate(m.date)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {client.notes && (
            <div className="mt-8 pt-6 border-t border-slate-gray/15">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray mb-2">Catatan</div>
              <p className="text-sm text-navy-dark whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <StatCard
            label="Pending Invoice"
            value={formatIDR(totalPending)}
            tone={totalPending > 0 ? "warning" : "default"}
            hint={totalPending > 0 ? "Tagihan belum lunas" : "Semua tagihan lunas"}
          />
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Project" value={relatedProjects.length} />
            <StatCard label="Avg Progress" value={`${avgProgress}%`} tone="accent" />
          </div>
          {relatedProjects.length > 0 && <BudgetSummary snapshot={clientRollup} />}
        </div>
      </div>

      {/* PROJECT LIST */}
      <section className="mb-16">
        <SectionTitle
          title="Project Terkait"
          description="Klik project untuk lihat tracker harian, revisi, task, meeting, dan detail anggaran"
          action={<Link href="/projects"><Button variant="secondary">+ Tambah Project</Button></Link>}
        />
        {relatedProjects.length === 0 ? (
          <EmptyState
            title="Belum ada project"
            description="Buka halaman Project untuk membuat project baru dan kaitkan dengan klien ini."
            action={<Link href="/projects"><Button>Ke Halaman Project</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedProjects.map((p) => {
              const snapshot = getProjectBudgetSnapshot(p, data.transactions);
              const tasksDone = data.tasks.filter(t => t.projectId === p.id && t.status === "done").length;
              const tasksTotal = data.tasks.filter(t => t.projectId === p.id).length;
              const revTotal = data.revisions.filter(r => r.projectId === p.id).length;
              const revDone = data.revisions.filter(r => r.projectId === p.id && r.status === "done").length;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="group rounded-lg border border-slate-gray/20 bg-white p-6 hover:border-ashas-blue transition-colors block"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy-dark truncate">{p.name}</h3>
                      {p.description && (
                        <p className="text-xs text-slate-gray mt-1 line-clamp-1">{p.description}</p>
                      )}
                    </div>
                    <Badge tone={projectStatusTone(p.status)}>
                      {projectStatusLabel(p.status)}
                    </Badge>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-gray/15 overflow-hidden mb-4">
                    <div className="h-full bg-ashas-blue rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">Progress</div>
                      <div className="font-extrabold text-navy-dark mt-0.5">{p.progress}%</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">Net Cash</div>
                      <div className={`font-extrabold mt-0.5 ${snapshot.netCash < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {snapshot.netCash < 0 ? "−" : "+"}{formatIDR(Math.abs(snapshot.netCash))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">Task</div>
                      <div className="font-bold text-navy-dark mt-0.5">{tasksDone}/{tasksTotal}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-gray">Revisi</div>
                      <div className="font-bold text-navy-dark mt-0.5">{revDone}/{revTotal}</div>
                    </div>
                  </div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-cyan-accent group-hover:text-ashas-blue transition-colors">
                    Tracker · Revisi · Meeting · Detail →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* EDIT MODAL */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Klien"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={submitEdit}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama klien *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </Field>
          <Field label="Perusahaan">
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Telepon">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}>
                <option value="active">Aktif</option>
                <option value="lead">Lead / prospek</option>
                <option value="negosiasi">Negosiasi</option>
                <option value="revisi">Revisi</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="inactive">Non-aktif</option>
              </Select>
            </Field>
            <Field label="Deadline">
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Field>
          </div>
          <Field label="Referral / Sumber klien">
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Contoh: Instagram, referral Pak Budi, Google…" />
          </Field>
          <Field label="Catatan">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
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
