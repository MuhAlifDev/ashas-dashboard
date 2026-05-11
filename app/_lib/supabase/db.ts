/**
 * Mappers between Supabase (snake_case) DB rows and the app's TypeScript
 * types (camelCase). DB rows have a user_id column; the app types do not.
 */

import type {
  Client,
  ClientStatus,
  MeetingNote,
  Project,
  ProjectStatus,
  Revision,
  RevisionStatus,
  Task,
  TaskPriority,
  TaskStatus,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../types";

// ─── CLIENT ────────────────────────────────────────────────

export function fromDbClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    company: (row.company as string | null) ?? undefined,
    email: (row.email as string | null) ?? undefined,
    phone: (row.phone as string | null) ?? undefined,
    status: row.status as ClientStatus,
    deadline: (row.deadline as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    source: (row.source as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export function toDbClient(c: Client, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    company: c.company ?? null,
    email: c.email ?? null,
    phone: c.phone ?? null,
    status: c.status,
    deadline: c.deadline ?? null,
    notes: c.notes ?? null,
    source: c.source ?? null,
    created_at: c.createdAt,
  };
}

// ─── PROJECT ───────────────────────────────────────────────

export function fromDbProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    clientId: (row.client_id as string | null) ?? undefined,
    description: (row.description as string | null) ?? undefined,
    status: row.status as ProjectStatus,
    budget: (row.budget as number | null) ?? undefined,
    progress: row.progress as number,
    createdAt: row.created_at as string,
  };
}

export function toDbProject(p: Project, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    client_id: p.clientId ?? null,
    name: p.name,
    description: p.description ?? null,
    status: p.status,
    budget: p.budget ?? null,
    progress: p.progress,
    created_at: p.createdAt,
  };
}

// ─── TASK ──────────────────────────────────────────────────

export function fromDbTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    projectId: (row.project_id as string | null) ?? undefined,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    dueDate: (row.due_date as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export function toDbTask(t: Task, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    project_id: t.projectId ?? null,
    title: t.title,
    status: t.status,
    priority: t.priority,
    due_date: t.dueDate ?? null,
    notes: t.notes ?? null,
    created_at: t.createdAt,
  };
}

// ─── TRANSACTION ───────────────────────────────────────────

export function fromDbTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    type: row.type as TransactionType,
    description: row.description as string,
    amount: row.amount as number,
    clientId: (row.client_id as string | null) ?? undefined,
    projectId: (row.project_id as string | null) ?? undefined,
    status: row.status as TransactionStatus,
    date: row.date as string,
    createdAt: row.created_at as string,
  };
}

export function toDbTransaction(t: Transaction, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    client_id: t.clientId ?? null,
    project_id: t.projectId ?? null,
    type: t.type,
    description: t.description,
    amount: t.amount,
    status: t.status,
    date: t.date,
    created_at: t.createdAt,
  };
}

// ─── MEETING NOTE ──────────────────────────────────────────

export function fromDbMeetingNote(row: Record<string, unknown>): MeetingNote {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    projectId: (row.project_id as string | null) ?? undefined,
    title: row.title as string,
    content: row.content as string,
    date: row.date as string,
    createdAt: row.created_at as string,
  };
}

export function toDbMeetingNote(m: MeetingNote, userId: string) {
  return {
    id: m.id,
    user_id: userId,
    client_id: m.clientId,
    project_id: m.projectId ?? null,
    title: m.title,
    content: m.content,
    date: m.date,
    created_at: m.createdAt,
  };
}

// ─── DRAWING ───────────────────────────────────────────────

export function fromDbDrawing(row: Record<string, unknown>): import("../types").Drawing {
  return {
    id: row.id as string,
    name: row.name as string,
    data: (row.data as Record<string, unknown>) ?? {},
    updatedAt: row.updated_at as string,
    createdAt: row.created_at as string,
  };
}

export function toDbDrawing(d: import("../types").Drawing, userId: string) {
  return {
    id: d.id,
    user_id: userId,
    name: d.name,
    data: d.data,
    updated_at: d.updatedAt,
    created_at: d.createdAt,
  };
}

// ─── DAILY LOG ─────────────────────────────────────────────

export function fromDbDailyLog(row: Record<string, unknown>): import("../types").DailyLog {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    note: row.note as string,
    date: row.date as string,
    createdAt: row.created_at as string,
  };
}

export function toDbDailyLog(l: import("../types").DailyLog, userId: string) {
  return {
    id: l.id,
    user_id: userId,
    project_id: l.projectId,
    note: l.note,
    date: l.date,
    created_at: l.createdAt,
  };
}

// ─── REVISION ──────────────────────────────────────────────

export function fromDbRevision(row: Record<string, unknown>): Revision {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    projectId: (row.project_id as string | null) ?? undefined,
    title: row.title as string,
    description: (row.description as string | null) ?? undefined,
    status: row.status as RevisionStatus,
    requestedDate: row.requested_date as string,
    completedDate: (row.completed_date as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export function toDbRevision(r: Revision, userId: string) {
  return {
    id: r.id,
    user_id: userId,
    client_id: r.clientId,
    project_id: r.projectId ?? null,
    title: r.title,
    description: r.description ?? null,
    status: r.status,
    requested_date: r.requestedDate,
    completed_date: r.completedDate ?? null,
    notes: r.notes ?? null,
    created_at: r.createdAt,
  };
}
