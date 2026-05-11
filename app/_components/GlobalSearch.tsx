"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./DashboardProvider";

type Result = {
  type: "client" | "project" | "task";
  id: string;
  title: string;
  sub?: string;
  href: string;
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data } = useDashboard();

  // Ctrl+K to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const out: Result[] = [];

    data.clients
      .filter((c) => [c.name, c.company, c.email].filter(Boolean).some((v) => v!.toLowerCase().includes(q)))
      .slice(0, 3)
      .forEach((c) => out.push({ type: "client", id: c.id, title: c.name, sub: c.company, href: `/clients/${c.id}` }));

    data.projects
      .filter((p) => {
        const client = data.clients.find((c) => c.id === p.clientId);
        return [p.name, p.description, client?.name].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
      })
      .slice(0, 3)
      .forEach((p) => {
        const client = data.clients.find((c) => c.id === p.clientId);
        out.push({ type: "project", id: p.id, title: p.name, sub: client?.name, href: `/projects/${p.id}` });
      });

    data.tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) => {
        const project = data.projects.find((p) => p.id === t.projectId);
        out.push({ type: "task", id: t.id, title: t.title, sub: project?.name, href: `/tasks` });
      });

    return out;
  }, [query, data]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  const TYPE_LABEL: Record<Result["type"], string> = {
    client: "Klien",
    project: "Project",
    task: "Task",
  };

  const TYPE_COLOR: Record<Result["type"], string> = {
    client: "bg-violet-50 text-violet-700 border-violet-200",
    project: "bg-blue-50 text-blue-700 border-blue-200",
    task: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 rounded-md border border-slate-gray/30 bg-white/5 px-3 py-2 text-xs font-bold text-slate-gray hover:bg-white/10 hover:text-off-white transition-colors"
        aria-label="Search"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <span>Cari</span>
        <kbd className="ml-1 rounded bg-white/10 px-1 py-0.5 text-[10px]">⌘K</kbd>
      </button>
      <button onClick={() => setOpen(true)} className="sm:hidden text-slate-gray hover:text-off-white p-2" aria-label="Search">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-navy-dark/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-off-white border border-slate-gray/20 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-gray/20">
              <svg className="h-4 w-4 shrink-0 text-slate-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari klien, project, atau task…"
                className="flex-1 bg-transparent text-sm text-navy-dark placeholder:text-slate-gray focus:outline-none font-bold"
              />
              <kbd className="shrink-0 text-[11px] text-slate-gray bg-slate-gray/15 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>

            {query && (
              <div className="max-h-80 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-gray">
                    Tidak ada hasil untuk "<strong>{query}</strong>"
                  </div>
                ) : (
                  <ul>
                    {results.map((r) => (
                      <li key={`${r.type}-${r.id}`}>
                        <button
                          onClick={() => navigate(r.href)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white text-left transition-colors"
                        >
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TYPE_COLOR[r.type]}`}>
                            {TYPE_LABEL[r.type]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-navy-dark truncate">{r.title}</div>
                            {r.sub && <div className="text-xs text-slate-gray truncate">{r.sub}</div>}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!query && (
              <div className="px-4 py-6 text-center text-sm text-slate-gray">
                Ketik nama klien, project, atau task untuk mencari
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
