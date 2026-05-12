"use client";

import { useState } from "react";
import { useDashboard } from "../_components/DashboardProvider";
import type { Tool, ToolCategory } from "../_lib/types";

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  frontend: "Frontend",
  design: "Design",
  backend: "Backend",
  framework: "Framework",
  cms: "CMS",
  asset: "Asset & Resource",
  "ai-agent": "AI & Agent",
  other: "Lainnya",
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "frontend",
  "design",
  "backend",
  "framework",
  "cms",
  "asset",
  "ai-agent",
  "other",
];

const CATEGORY_COLORS: Record<ToolCategory, string> = {
  frontend: "bg-ashas-blue/15 text-ashas-blue",
  design: "bg-cyan-accent/10 text-cyan-accent",
  backend: "bg-emerald-600/15 text-emerald-600",
  framework: "bg-amber-500/15 text-amber-600",
  cms: "bg-rose-600/15 text-rose-600",
  asset: "bg-slate-gray/20 text-slate-gray",
  "ai-agent": "bg-violet-500/15 text-violet-600",
  other: "bg-slate-gray/15 text-slate-gray",
};

type FormState = {
  name: string;
  category: ToolCategory;
  description: string;
  url: string;
};

const emptyForm: FormState = {
  name: "",
  category: "frontend",
  description: "",
  url: "",
};

interface ToolsPanelProps {
  filterCategory: ToolCategory | null;
}

export default function ToolsPanel({ filterCategory }: ToolsPanelProps) {
  const { data, addTool, updateTool, deleteTool } = useDashboard();
  const { tools } = data;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(tool: Tool) {
    setEditing(tool);
    setForm({
      name: tool.name,
      category: tool.category,
      description: tool.description ?? "",
      url: tool.url ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    if (editing) {
      await updateTool(editing.id, {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        url: form.url.trim() || undefined,
      });
    } else {
      await addTool({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        url: form.url.trim() || undefined,
      });
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus tool "${name}"?`)) return;
    await deleteTool(id);
  }

  const visibleCategories = filterCategory ? [filterCategory] : CATEGORY_ORDER;

  const grouped = CATEGORY_ORDER.reduce<Record<ToolCategory, Tool[]>>(
    (acc, cat) => {
      acc[cat] = tools.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<ToolCategory, Tool[]>,
  );

  return (
    <div className="flex-1 overflow-y-auto bg-off-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-off-white border-b border-slate-gray/20 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-6 bg-cyan-accent rounded-full" />
          <h1 className="text-xl font-extrabold text-navy-dark">
            Tools Saya
            {filterCategory && (
              <span className="ml-2 text-sm font-bold text-ashas-blue">
                — {CATEGORY_LABELS[filterCategory]}
              </span>
            )}
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="rounded-lg bg-navy-dark text-off-white px-4 py-2 text-sm font-bold hover:bg-ashas-blue transition-colors"
        >
          + Tambah Tool
        </button>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-dark/5">
              <svg
                className="h-8 w-8 text-slate-gray"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h2 className="text-lg font-extrabold text-navy-dark">
              Belum ada tools
            </h2>
            <p className="mt-2 text-sm text-slate-gray max-w-xs">
              Tambahkan tools yang Anda gunakan — frontend, design, backend,
              CMS, AI agent, dan lainnya.
            </p>
            <button
              onClick={openAdd}
              className="mt-6 rounded-lg bg-navy-dark text-off-white px-6 py-3 text-sm font-bold hover:bg-ashas-blue transition-colors"
            >
              + Tambah Tool Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {visibleCategories.map((cat) => {
              const items = grouped[cat];
              if (items.length === 0) return null;
              return (
                <section key={cat} id={`cat-${cat}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="block w-1 h-4 bg-cyan-accent rounded-full" />
                    <h2 className="text-sm font-bold text-navy-dark uppercase tracking-wider">
                      {CATEGORY_LABELS[cat]}
                    </h2>
                    <span className="text-xs text-slate-gray font-bold">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((tool) => (
                      <div
                        key={tool.id}
                        className="group bg-white rounded-xl p-5 border border-slate-gray/15 hover:border-slate-gray/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-bold text-navy-dark text-sm leading-snug">
                            {tool.name}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => openEdit(tool)}
                              className="rounded p-1 text-slate-gray hover:text-navy-dark hover:bg-slate-gray/10 transition-colors"
                              title="Edit"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(tool.id, tool.name)}
                              className="rounded p-1 text-slate-gray hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Hapus"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${CATEGORY_COLORS[tool.category]}`}
                        >
                          {CATEGORY_LABELS[tool.category]}
                        </span>
                        {tool.description && (
                          <p className="text-xs text-slate-gray leading-relaxed mt-1">
                            {tool.description}
                          </p>
                        )}
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1 text-[11px] text-ashas-blue hover:text-cyan-accent transition-colors font-bold"
                          >
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            Buka Website
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-1 h-5 bg-cyan-accent rounded-full" />
              <h2 className="text-lg font-extrabold text-navy-dark">
                {editing ? "Edit Tool" : "Tambah Tool"}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-gray mb-1.5">
                  Nama Tool <span className="text-rose-500">*</span>
                </label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="cth. React, Figma, Laravel, Claude..."
                  className="w-full rounded-lg border border-slate-gray/30 bg-off-white px-4 py-2.5 text-sm text-navy-dark placeholder:text-slate-gray focus:outline-none focus:border-ashas-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-gray mb-1.5">
                  Kategori
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as ToolCategory,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-gray/30 bg-off-white px-4 py-2.5 text-sm text-navy-dark focus:outline-none focus:border-ashas-blue transition-colors"
                >
                  {CATEGORY_ORDER.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-gray mb-1.5">
                  Deskripsi{" "}
                  <span className="text-slate-gray/60 font-normal normal-case tracking-normal">
                    (opsional)
                  </span>
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Digunakan untuk apa..."
                  className="w-full rounded-lg border border-slate-gray/30 bg-off-white px-4 py-2.5 text-sm text-navy-dark placeholder:text-slate-gray focus:outline-none focus:border-ashas-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-gray mb-1.5">
                  URL Website{" "}
                  <span className="text-slate-gray/60 font-normal normal-case tracking-normal">
                    (opsional)
                  </span>
                </label>
                <input
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-gray/30 bg-off-white px-4 py-2.5 text-sm text-navy-dark placeholder:text-slate-gray focus:outline-none focus:border-ashas-blue transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-gray/30 px-4 py-2.5 text-sm font-bold text-navy-dark hover:bg-off-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim()}
                className="flex-1 rounded-lg bg-navy-dark text-off-white px-4 py-2.5 text-sm font-bold hover:bg-ashas-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editing ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
