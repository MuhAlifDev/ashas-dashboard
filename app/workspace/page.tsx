"use client";

import { useState } from "react";
import { useDashboard } from "../_components/DashboardProvider";
import ExcalidrawBoard from "../_components/ExcalidrawBoard";
import type { Drawing } from "../_lib/types";

export default function WorkspacePage() {
  const { data, addDrawing, updateDrawing, deleteDrawing } = useDashboard();
  const { drawings } = data;

  const [activeId, setActiveId] = useState<string | null>(
    drawings[0]?.id ?? null,
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const activeDrawing = drawings.find((d) => d.id === activeId) ?? null;

  async function createBoard() {
    const name = `Papan ${drawings.length + 1}`;
    const newDrawing = await addDrawing(name);
    if (newDrawing) setActiveId(newDrawing.id);
  }

  async function handleSave(id: string, drawingData: Record<string, unknown>) {
    setSaveStatus("saving");
    await updateDrawing(id, { data: drawingData });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  function startRename(d: Drawing) {
    setRenamingId(d.id);
    setRenameValue(d.name);
  }

  async function submitRename() {
    if (!renamingId || !renameValue.trim()) return;
    await updateDrawing(renamingId, { name: renameValue.trim() });
    setRenamingId(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus papan "${name}"? Gambar akan hilang permanen.`)) return;
    deleteDrawing(id);
    if (activeId === id) {
      const remaining = drawings.filter((d) => d.id !== id);
      setActiveId(remaining[0]?.id ?? null);
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT PANEL — board list */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-gray/20 bg-navy-dark text-off-white">
        <div className="border-b border-slate-gray/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="block w-1 h-4 bg-cyan-accent rounded-full" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-off-white">
              Workspace
            </h2>
          </div>
          <button
            onClick={createBoard}
            className="w-full rounded-md border border-slate-gray/30 bg-white/5 px-3 py-2 text-xs font-bold text-off-white hover:bg-white/10 transition-colors text-left"
          >
            + Papan Baru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {drawings.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-slate-gray">Belum ada papan.</p>
              <button
                onClick={createBoard}
                className="mt-3 text-xs font-bold text-cyan-accent hover:text-off-white transition-colors"
              >
                Buat papan pertama →
              </button>
            </div>
          ) : (
            drawings.map((d) => (
              <div
                key={d.id}
                className={`group relative mx-2 mb-1 rounded-md px-3 py-2.5 cursor-pointer transition-colors ${
                  activeId === d.id
                    ? "bg-ashas-blue/20 border border-ashas-blue/40"
                    : "hover:bg-white/5 border border-transparent"
                }`}
                onClick={() => setActiveId(d.id)}
              >
                {renamingId === d.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitRename();
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-xs font-bold text-off-white border-b border-cyan-accent focus:outline-none pb-0.5"
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <svg className="h-3 w-3 shrink-0 text-slate-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      <span className="text-xs font-bold text-off-white truncate">{d.name}</span>
                    </div>
                    <div className="mt-0.5 ml-5 text-[10px] text-slate-gray">
                      {new Date(d.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </div>
                    {/* Actions */}
                    <div className="absolute right-2 top-2.5 hidden group-hover:flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(d); }}
                        className="rounded p-1 text-slate-gray hover:text-off-white hover:bg-white/10 transition-colors"
                        title="Rename"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(d.id, d.name); }}
                        className="rounded p-1 text-slate-gray hover:text-rose-400 hover:bg-white/10 transition-colors"
                        title="Hapus"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Save status indicator */}
        <div className="border-t border-slate-gray/20 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            {saveStatus === "saving" && (
              <><span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /><span className="text-amber-400">Menyimpan…</span></>
            )}
            {saveStatus === "saved" && (
              <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-emerald-400">Tersimpan</span></>
            )}
            {saveStatus === "idle" && (
              <><span className="h-1.5 w-1.5 rounded-full bg-slate-gray/50" /><span className="text-slate-gray">Auto-save aktif</span></>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL — canvas */}
      <main className="flex flex-1 flex-col bg-white overflow-hidden">
        {activeDrawing ? (
          <ExcalidrawBoard
            key={activeDrawing.id}
            drawing={activeDrawing}
            onSave={(drawingData) => handleSave(activeDrawing.id, drawingData)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-off-white">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-dark/5">
                <svg className="h-8 w-8 text-slate-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold text-navy-dark">Buat papan pertama Anda</h2>
              <p className="text-sm text-slate-gray mt-2 max-w-xs">
                Gunakan whiteboard untuk wireframe, diagram, mind map, atau catatan visual apa saja.
              </p>
              <button
                onClick={createBoard}
                className="mt-6 rounded-lg bg-navy-dark text-off-white px-6 py-3 text-sm font-bold hover:bg-ashas-blue transition-colors"
              >
                + Buat Papan Baru
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
