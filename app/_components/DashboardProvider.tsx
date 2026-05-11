"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Client,
  DailyLog,
  DashboardData,
  Drawing,
  MeetingNote,
  Project,
  Revision,
  Task,
  Transaction,
} from "../_lib/types";
import { uid } from "../_lib/format";
import { createClient } from "../_lib/supabase/client";
import {
  fromDbClient,
  fromDbDailyLog,
  fromDbMeetingNote,
  fromDbProject,
  fromDbRevision,
  fromDbTask,
  fromDbTransaction,
  toDbClient,
  toDbDailyLog,
  toDbMeetingNote,
  toDbProject,
  toDbRevision,
  toDbTask,
  toDbTransaction,
} from "../_lib/supabase/db";

const DRAWINGS_KEY = "ashas-drawings:v1";

function loadDrawingsFromStorage(_userId: string): Drawing[] {
  try {
    const raw = window.localStorage.getItem(DRAWINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Drawing[];
  } catch {
    return [];
  }
}

function saveDrawingsToStorage(drawings: Drawing[]): void {
  try {
    window.localStorage.setItem(DRAWINGS_KEY, JSON.stringify(drawings));
  } catch {
    // ignore quota errors
  }
}

type Ctx = {
  ready: boolean;
  data: DashboardData;
  addClient: (c: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addProject: (p: Omit<Project, "id" | "createdAt">) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (t: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (
    id: string,
    patch: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addMeetingNote: (m: Omit<MeetingNote, "id" | "createdAt">) => Promise<void>;
  updateMeetingNote: (
    id: string,
    patch: Partial<MeetingNote>,
  ) => Promise<void>;
  deleteMeetingNote: (id: string) => Promise<void>;
  addRevision: (r: Omit<Revision, "id" | "createdAt">) => Promise<void>;
  updateRevision: (id: string, patch: Partial<Revision>) => Promise<void>;
  deleteRevision: (id: string) => Promise<void>;
  addDailyLog: (l: Omit<DailyLog, "id" | "createdAt">) => Promise<void>;
  deleteDailyLog: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  addDrawing: (name: string) => Promise<Drawing | null>;
  updateDrawing: (id: string, patch: { name?: string; data?: Record<string, unknown> }) => Promise<void>;
  deleteDrawing: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const empty: DashboardData = {
  clients: [],
  projects: [],
  tasks: [],
  transactions: [],
  meetingNotes: [],
  revisions: [],
  dailyLogs: [],
  drawings: [],
};

const DashboardContext = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const userIdRef = useRef<string | null>(null);
  const [data, setData] = useState<DashboardData>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;
      userIdRef.current = user.id;

      const [c, p, t, tr, mn, rv, dl] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("meeting_notes")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("revisions")
          .select("*")
          .eq("user_id", user.id)
          .order("requested_date", { ascending: false }),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      const fetched: DashboardData = {
        clients: c.data?.map(fromDbClient) ?? [],
        projects: p.data?.map(fromDbProject) ?? [],
        tasks: t.data?.map(fromDbTask) ?? [],
        transactions: tr.data?.map(fromDbTransaction) ?? [],
        meetingNotes: mn.data?.map(fromDbMeetingNote) ?? [],
        revisions: rv.data?.map(fromDbRevision) ?? [],
        dailyLogs: dl.data?.map(fromDbDailyLog) ?? [],
        drawings: loadDrawingsFromStorage(user.id),
      };

      if (!cancelled) setData(fetched);

      if (!cancelled) setReady(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // ─── CLIENTS ────────────────────────────────────────────
  const addClient = useCallback(
    async (c: Omit<Client, "id" | "createdAt">) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const item: Client = {
        ...c,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, clients: [item, ...d.clients] }));
      const { error } = await supabase
        .from("clients")
        .insert(toDbClient(item, uid_));
      if (error) {
        console.error(error);
        setData((d) => ({
          ...d,
          clients: d.clients.filter((x) => x.id !== item.id),
        }));
      }
    },
    [supabase],
  );

  const updateClient = useCallback(
    async (id: string, patch: Partial<Client>) => {
      // Auto-record status changes as a meeting note
      if (patch.status) {
        setData((d) => {
          const old = d.clients.find((c) => c.id === id);
          if (old && old.status !== patch.status) {
            const note: MeetingNote = {
              id: uid(),
              clientId: id,
              title: `Status: ${old.status} → ${patch.status}`,
              content: "",
              date: new Date().toISOString().slice(0, 10),
              createdAt: new Date().toISOString(),
            };
            const uid_ = userIdRef.current;
            if (uid_) {
              supabase.from("meeting_notes").insert(toDbMeetingNote(note, uid_));
            }
            return {
              ...d,
              clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
              meetingNotes: [note, ...d.meetingNotes],
            };
          }
          return { ...d, clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) };
        });
      } else {
        setData((d) => ({
          ...d,
          clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
      }
      // Core fields — always safe to update
      const corePatch: Record<string, unknown> = {};
      if ("name" in patch) corePatch.name = patch.name;
      if ("company" in patch) corePatch.company = patch.company ?? null;
      if ("email" in patch) corePatch.email = patch.email ?? null;
      if ("phone" in patch) corePatch.phone = patch.phone ?? null;
      if ("status" in patch) corePatch.status = patch.status;
      if ("deadline" in patch) corePatch.deadline = patch.deadline ?? null;
      if ("notes" in patch) corePatch.notes = patch.notes ?? null;

      await supabase.from("clients").update(corePatch).eq("id", id);

      // source column — update separately (column may not exist yet if SQL hasn't been run)
      if ("source" in patch) {
        await supabase
          .from("clients")
          .update({ source: patch.source ?? null })
          .eq("id", id);
      }
    },
    [supabase],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const clientProjectIds = data.projects
        .filter((p) => p.clientId === id)
        .map((p) => p.id);

      setData((d) => ({
        ...d,
        clients: d.clients.filter((c) => c.id !== id),
        projects: d.projects.filter((p) => p.clientId !== id),
        tasks: d.tasks.filter((t) => !clientProjectIds.includes(t.projectId ?? "")),
        revisions: d.revisions.filter((r) => r.clientId !== id),
        meetingNotes: d.meetingNotes.filter((m) => m.clientId !== id),
        transactions: d.transactions.filter((t) => t.clientId !== id),
      }));

      for (const pid of clientProjectIds) {
        await supabase.from("tasks").delete().eq("project_id", pid);
        await supabase.from("transactions").delete().eq("project_id", pid);
        await supabase.from("revisions").delete().eq("project_id", pid);
      }
      await supabase.from("transactions").delete().eq("client_id", id);
      await supabase.from("meeting_notes").delete().eq("client_id", id);
      await supabase.from("projects").delete().eq("client_id", id);
      await supabase.from("clients").delete().eq("id", id);
    },
    [supabase, data.projects],
  );

  // ─── PROJECTS ───────────────────────────────────────────
  const addProject = useCallback(
    async (p: Omit<Project, "id" | "createdAt">) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const item: Project = {
        ...p,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, projects: [item, ...d.projects] }));
      const { error } = await supabase
        .from("projects")
        .insert(toDbProject(item, uid_));
      if (error) {
        console.error(error);
        setData((d) => ({
          ...d,
          projects: d.projects.filter((x) => x.id !== item.id),
        }));
      }
    },
    [supabase],
  );

  const updateProject = useCallback(
    async (id: string, patch: Partial<Project>) => {
      setData((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        ),
      }));
      const dbPatch: Record<string, unknown> = {};
      if ("name" in patch) dbPatch.name = patch.name;
      if ("clientId" in patch) dbPatch.client_id = patch.clientId ?? null;
      if ("description" in patch)
        dbPatch.description = patch.description ?? null;
      if ("status" in patch) dbPatch.status = patch.status;
      if ("budget" in patch) dbPatch.budget = patch.budget ?? null;
      if ("progress" in patch) dbPatch.progress = patch.progress;
      await supabase.from("projects").update(dbPatch).eq("id", id);
    },
    [supabase],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      setData((d) => ({
        ...d,
        projects: d.projects.filter((p) => p.id !== id),
        tasks: d.tasks.filter((t) => t.projectId !== id),
        revisions: d.revisions.filter((r) => r.projectId !== id),
        meetingNotes: d.meetingNotes.map((m) =>
          m.projectId === id ? { ...m, projectId: undefined } : m,
        ),
        transactions: d.transactions.filter((t) => t.projectId !== id),
      }));
      await supabase.from("tasks").delete().eq("project_id", id);
      await supabase.from("revisions").delete().eq("project_id", id);
      await supabase.from("transactions").delete().eq("project_id", id);
      await supabase.from("projects").delete().eq("id", id);
    },
    [supabase],
  );

  // ─── TASKS ──────────────────────────────────────────────
  const addTask = useCallback(
    async (t: Omit<Task, "id" | "createdAt">) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const item: Task = { ...t, id: uid(), createdAt: new Date().toISOString() };
      setData((d) => ({ ...d, tasks: [item, ...d.tasks] }));
      const { error } = await supabase
        .from("tasks")
        .insert(toDbTask(item, uid_));
      if (error) {
        console.error(error);
        setData((d) => ({
          ...d,
          tasks: d.tasks.filter((x) => x.id !== item.id),
        }));
      }
    },
    [supabase],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      setData((d) => ({
        ...d,
        tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));
      const dbPatch: Record<string, unknown> = {};
      if ("title" in patch) dbPatch.title = patch.title;
      if ("projectId" in patch) dbPatch.project_id = patch.projectId ?? null;
      if ("status" in patch) dbPatch.status = patch.status;
      if ("priority" in patch) dbPatch.priority = patch.priority;
      if ("dueDate" in patch) dbPatch.due_date = patch.dueDate ?? null;
      if ("notes" in patch) dbPatch.notes = patch.notes ?? null;
      await supabase.from("tasks").update(dbPatch).eq("id", id);
    },
    [supabase],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setData((d) => ({
        ...d,
        tasks: d.tasks.filter((t) => t.id !== id),
      }));
      await supabase.from("tasks").delete().eq("id", id);
    },
    [supabase],
  );

  // ─── TRANSACTIONS ────────────────────────────────────────
  const addTransaction = useCallback(
    async (t: Omit<Transaction, "id" | "createdAt">) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const item: Transaction = {
        ...t,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, transactions: [item, ...d.transactions] }));
      const { error } = await supabase
        .from("transactions")
        .insert(toDbTransaction(item, uid_));
      if (error) {
        console.error(error);
        setData((d) => ({
          ...d,
          transactions: d.transactions.filter((x) => x.id !== item.id),
        }));
      }
    },
    [supabase],
  );

  const updateTransaction = useCallback(
    async (id: string, patch: Partial<Transaction>) => {
      setData((d) => ({
        ...d,
        transactions: d.transactions.map((t) =>
          t.id === id ? { ...t, ...patch } : t,
        ),
      }));
      const dbPatch: Record<string, unknown> = {};
      if ("type" in patch) dbPatch.type = patch.type;
      if ("description" in patch) dbPatch.description = patch.description;
      if ("amount" in patch) dbPatch.amount = patch.amount;
      if ("clientId" in patch) dbPatch.client_id = patch.clientId ?? null;
      if ("projectId" in patch) dbPatch.project_id = patch.projectId ?? null;
      if ("status" in patch) dbPatch.status = patch.status;
      if ("date" in patch) dbPatch.date = patch.date;
      await supabase.from("transactions").update(dbPatch).eq("id", id);
    },
    [supabase],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setData((d) => ({
        ...d,
        transactions: d.transactions.filter((t) => t.id !== id),
      }));
      await supabase.from("transactions").delete().eq("id", id);
    },
    [supabase],
  );

  // ─── MEETING NOTES ───────────────────────────────────────
  const addMeetingNote = useCallback(
    async (m: Omit<MeetingNote, "id" | "createdAt">) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const item: MeetingNote = {
        ...m,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, meetingNotes: [item, ...d.meetingNotes] }));
      const { error } = await supabase
        .from("meeting_notes")
        .insert(toDbMeetingNote(item, uid_));
      if (error) {
        console.error(error);
        setData((d) => ({
          ...d,
          meetingNotes: d.meetingNotes.filter((x) => x.id !== item.id),
        }));
      }
    },
    [supabase],
  );

  const updateMeetingNote = useCallback(
    async (id: string, patch: Partial<MeetingNote>) => {
      setData((d) => ({
        ...d,
        meetingNotes: d.meetingNotes.map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        ),
      }));
      const dbPatch: Record<string, unknown> = {};
      if ("title" in patch) dbPatch.title = patch.title;
      if ("content" in patch) dbPatch.content = patch.content;
      if ("date" in patch) dbPatch.date = patch.date;
      if ("projectId" in patch) dbPatch.project_id = patch.projectId ?? null;
      await supabase.from("meeting_notes").update(dbPatch).eq("id", id);
    },
    [supabase],
  );

  const deleteMeetingNote = useCallback(
    async (id: string) => {
      setData((d) => ({
        ...d,
        meetingNotes: d.meetingNotes.filter((m) => m.id !== id),
      }));
      await supabase.from("meeting_notes").delete().eq("id", id);
    },
    [supabase],
  );

  // ─── REVISIONS ───────────────────────────────────────────
  const addRevision = useCallback(
    async (r: Omit<Revision, "id" | "createdAt">) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const item: Revision = {
        ...r,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, revisions: [item, ...d.revisions] }));
      const { error } = await supabase
        .from("revisions")
        .insert(toDbRevision(item, uid_));
      if (error) {
        console.error(error);
        setData((d) => ({
          ...d,
          revisions: d.revisions.filter((x) => x.id !== item.id),
        }));
      }
    },
    [supabase],
  );

  const updateRevision = useCallback(
    async (id: string, patch: Partial<Revision>) => {
      setData((d) => ({
        ...d,
        revisions: d.revisions.map((r) =>
          r.id === id ? { ...r, ...patch } : r,
        ),
      }));
      const dbPatch: Record<string, unknown> = {};
      if ("title" in patch) dbPatch.title = patch.title;
      if ("description" in patch)
        dbPatch.description = patch.description ?? null;
      if ("status" in patch) dbPatch.status = patch.status;
      if ("projectId" in patch) dbPatch.project_id = patch.projectId ?? null;
      if ("requestedDate" in patch)
        dbPatch.requested_date = patch.requestedDate;
      if ("completedDate" in patch)
        dbPatch.completed_date = patch.completedDate ?? null;
      if ("notes" in patch) dbPatch.notes = patch.notes ?? null;
      await supabase.from("revisions").update(dbPatch).eq("id", id);
    },
    [supabase],
  );

  const deleteRevision = useCallback(
    async (id: string) => {
      setData((d) => ({
        ...d,
        revisions: d.revisions.filter((r) => r.id !== id),
      }));
      await supabase.from("revisions").delete().eq("id", id);
    },
    [supabase],
  );

  // ─── DUPLICATE PROJECT ───────────────────────────────────
  const duplicateProject = useCallback(
    async (id: string) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const original = data.projects.find((p) => p.id === id);
      if (!original) return;
      const cloneId = uid();
      const clone: Project = {
        ...original,
        id: cloneId,
        name: `${original.name} (Salinan)`,
        progress: 0,
        createdAt: new Date().toISOString(),
      };
      // Clone tasks too
      const originalTasks = data.tasks.filter((t) => t.projectId === id);
      const clonedTasks: Task[] = originalTasks.map((t) => ({
        ...t,
        id: uid(),
        projectId: cloneId,
        status: "todo" as const,
        createdAt: new Date().toISOString(),
      }));
      setData((d) => ({
        ...d,
        projects: [clone, ...d.projects],
        tasks: [...clonedTasks, ...d.tasks],
      }));
      await supabase.from("projects").insert(toDbProject(clone, uid_));
      if (clonedTasks.length > 0) {
        await supabase.from("tasks").insert(clonedTasks.map((t) => toDbTask(t, uid_)));
      }
    },
    [supabase, data.projects, data.tasks],
  );

  // ─── DAILY LOGS ──────────────────────────────────────────
  const addDailyLog = useCallback(
    async (l: Omit<DailyLog, "id" | "createdAt">) => {
      const uid_ = userIdRef.current;
      if (!uid_) return;
      const item: DailyLog = {
        ...l,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, dailyLogs: [item, ...d.dailyLogs] }));
      const { error } = await supabase
        .from("daily_logs")
        .insert(toDbDailyLog(item, uid_));
      if (error) {
        console.error(error);
        setData((d) => ({
          ...d,
          dailyLogs: d.dailyLogs.filter((x) => x.id !== item.id),
        }));
      }
    },
    [supabase],
  );

  const deleteDailyLog = useCallback(
    async (id: string) => {
      setData((d) => ({
        ...d,
        dailyLogs: d.dailyLogs.filter((l) => l.id !== id),
      }));
      await supabase.from("daily_logs").delete().eq("id", id);
    },
    [supabase],
  );

  // ─── DRAWINGS (localStorage — no Supabase table needed) ──
  const addDrawing = useCallback(async (name: string): Promise<Drawing | null> => {
    const now = new Date().toISOString();
    const item: Drawing = { id: uid(), name, data: {}, updatedAt: now, createdAt: now };
    setData((d) => {
      const newDrawings = [item, ...d.drawings];
      saveDrawingsToStorage(newDrawings);
      return { ...d, drawings: newDrawings };
    });
    return item;
  }, []);

  const updateDrawing = useCallback(async (id: string, patch: { name?: string; data?: Record<string, unknown> }) => {
    const now = new Date().toISOString();
    setData((d) => {
      const newDrawings = d.drawings.map((dr) =>
        dr.id === id ? { ...dr, ...patch, updatedAt: now } : dr,
      );
      saveDrawingsToStorage(newDrawings);
      return { ...d, drawings: newDrawings };
    });
  }, []);

  const deleteDrawing = useCallback(async (id: string) => {
    setData((d) => {
      const newDrawings = d.drawings.filter((dr) => dr.id !== id);
      saveDrawingsToStorage(newDrawings);
      return { ...d, drawings: newDrawings };
    });
  }, []);

  // ─── AUTH ────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, [supabase]);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      data,
      addClient,
      updateClient,
      deleteClient,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addMeetingNote,
      updateMeetingNote,
      deleteMeetingNote,
      addRevision,
      updateRevision,
      deleteRevision,
      addDailyLog,
      deleteDailyLog,
      duplicateProject,
      addDrawing,
      updateDrawing,
      deleteDrawing,
      signOut,
    }),
    [
      ready, data,
      addClient, updateClient, deleteClient,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addTransaction, updateTransaction, deleteTransaction,
      addMeetingNote, updateMeetingNote, deleteMeetingNote,
      addRevision, updateRevision, deleteRevision,
      addDailyLog, deleteDailyLog,
      duplicateProject,
      addDrawing, updateDrawing, deleteDrawing,
      signOut,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

