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
import { clientStatusLabel, clientStatusTone } from "../_lib/labels";
import type { Client, ClientStatus } from "../_lib/types";
import { daysUntil, formatDate } from "../_lib/format";
import { getClientColor } from "../_lib/colors";

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  deadline: string;
  notes: string;
  source: string;
};

const emptyForm: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  status: "active",
  deadline: "",
  notes: "",
  source: "",
};

const ALL_STATUSES: ClientStatus[] = [
  "active",
  "lead",
  "negosiasi",
  "revisi",
  "completed",
  "on-hold",
  "inactive",
];

export default function ClientsPage() {
  const { data, addClient, updateClient, deleteClient } = useDashboard();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.clients.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return [c.name, c.company, c.email, c.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [data.clients, query, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Client) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      company: c.company ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      status: c.status,
      deadline: c.deadline ?? "",
      notes: c.notes ?? "",
      source: c.source ?? "",
    });
    setModalOpen(true);
  }

  function submit() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      status: form.status,
      deadline: form.deadline || undefined,
      notes: form.notes.trim() || undefined,
      source: form.source.trim() || undefined,
    };
    if (editingId) {
      updateClient(editingId, payload);
    } else {
      addClient(payload);
    }
    setModalOpen(false);
  }

  function remove(id: string) {
    if (
      confirm(
        "Hapus klien ini? Project & transaksi yang terkait tidak ikut terhapus, tapi meeting notes & revisi terkait akan dihapus.",
      )
    )
      deleteClient(id);
  }

  return (
    <div>
      <PageHeader
        title="Client Management"
        description="Manage your client and prospect database. Click a card to view full details."
        action={<Button onClick={openCreate}>+ Tambah Klien</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, perusahaan, email…"
          className="flex-1 rounded-md border border-slate-gray/40 bg-white px-3.5 py-2.5 text-sm placeholder:text-slate-gray focus:border-ashas-blue focus:outline-none focus:ring-2 focus:ring-ashas-blue/20"
        />
        <div className="flex flex-wrap gap-1 rounded-md border border-slate-gray/20 bg-white p-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              statusFilter === "all"
                ? "bg-navy-dark text-off-white"
                : "text-slate-gray hover:bg-off-white"
            }`}
          >
            Semua
            <span className="ml-1.5 opacity-60">{data.clients.length}</span>
          </button>
          {ALL_STATUSES.map((s) => {
            const count = data.clients.filter((c) => c.status === s).length;
            if (count === 0 && statusFilter !== s) return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  statusFilter === s
                    ? "bg-navy-dark text-off-white"
                    : "text-slate-gray hover:bg-off-white"
                }`}
              >
                {clientStatusLabel(s)}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada klien"
          description={
            query || statusFilter !== "all"
              ? "Tidak ada klien yang cocok dengan filter."
              : "Tambah klien pertama Anda untuk mulai mengelola."
          }
          action={
            !query && statusFilter === "all" ? (
              <Button onClick={openCreate}>+ Tambah Klien</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const days = daysUntil(c.deadline);
            const overdue = days !== null && days < 0;
            const color = getClientColor(c.id, data.clients);
            return (
              <div
                key={c.id}
                className="group relative flex rounded-lg border border-slate-gray/20 overflow-hidden hover:border-slate-gray/40 transition-colors"
              >
                {/* Client color stripe */}
                <div
                  className="w-1.5 shrink-0"
                  style={{ background: color.accent }}
                />

                {/* Card body */}
                <div
                  className="relative flex-1 p-7"
                  style={{ backgroundColor: color.light }}
                >
                  <Link
                    href={`/clients/${c.id}`}
                    className="absolute inset-0 z-0"
                    aria-label={`Detail ${c.name}`}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy-dark truncate text-base">
                        {c.name}
                      </h3>
                      {c.company && (
                        <p className="text-xs text-slate-gray mt-1 truncate">
                          {c.company}
                        </p>
                      )}
                    </div>
                    <Badge tone={clientStatusTone(c.status)}>
                      {clientStatusLabel(c.status)}
                    </Badge>
                  </div>

                  <div className="relative mt-5 space-y-2 text-xs text-slate-gray">
                    {c.email && (
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold" style={{ color: color.accent }}>✉</span>
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: color.accent }}>☎</span>
                        {c.phone}
                      </div>
                    )}
                    {c.deadline && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: color.accent }}>▸</span>
                        <span>
                          Deadline{" "}
                          <span className={`font-bold ${overdue ? "text-rose-600" : "text-navy-dark"}`}>
                            {formatDate(c.deadline)}
                          </span>
                          {days !== null && days >= 0 && (
                            <span className="ml-1 text-slate-gray">({days}h)</span>
                          )}
                          {overdue && (
                            <span className="ml-1 text-rose-600 font-bold">
                              (-{Math.abs(days!)}h)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <p className="relative mt-5 text-xs text-slate-gray line-clamp-2 border-t border-slate-gray/15 pt-4">
                      {c.notes}
                    </p>
                  )}

                  <div className="relative mt-6 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(c); }}
                      className="text-xs font-bold text-slate-gray hover:text-navy-dark px-2 py-1 rounded hover:bg-off-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(c.id); }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
                    >
                      Hapus
                    </button>
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
        title={editingId ? "Edit Klien" : "Tambah Klien"}
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
          <Field label="Nama klien *">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              autoFocus
            />
          </Field>
          <Field label="Perusahaan / brand">
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Contoh: PT Maju Jaya"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@contoh.com"
              />
            </Field>
            <Field label="Telepon / WhatsApp">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+62 812-…"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ClientStatus })
                }
              >
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
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Dari mana klien tahu tentang Anda? (referral)">
            <Input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Contoh: Instagram, referral Pak Budi, Google…"
            />
          </Field>
          <Field label="Catatan">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Catatan tentang klien, kebutuhan, dll."
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
