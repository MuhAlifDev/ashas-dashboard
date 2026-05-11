import type {
  ClientStatus,
  ProjectStatus,
  RevisionStatus,
  TaskPriority,
  TaskStatus,
  TransactionStatus,
} from "./types";

export function clientStatusLabel(s: ClientStatus): string {
  switch (s) {
    case "active":
      return "Aktif";
    case "inactive":
      return "Non-aktif";
    case "lead":
      return "Lead";
    case "negosiasi":
      return "Negosiasi";
    case "revisi":
      return "Revisi";
    case "completed":
      return "Completed";
    case "on-hold":
      return "On Hold";
  }
}

export function clientStatusTone(s: ClientStatus) {
  switch (s) {
    case "active":
      return "emerald";
    case "inactive":
      return "slate";
    case "lead":
      return "violet";
    case "negosiasi":
      return "blue";
    case "revisi":
      return "amber";
    case "completed":
      return "cyan";
    case "on-hold":
      return "rose";
  }
}

export function projectStatusLabel(s: ProjectStatus): string {
  return s === "planning"
    ? "Perencanaan"
    : s === "in-progress"
      ? "Berjalan"
      : s === "review"
        ? "Review"
        : s === "completed"
          ? "Selesai"
          : "Ditunda";
}

export function projectStatusTone(s: ProjectStatus) {
  return s === "planning"
    ? "slate"
    : s === "in-progress"
      ? "blue"
      : s === "review"
        ? "violet"
        : s === "completed"
          ? "emerald"
          : "amber";
}

export function taskStatusLabel(s: TaskStatus): string {
  return s === "todo" ? "To-do" : s === "in-progress" ? "Dikerjakan" : "Selesai";
}

export function taskStatusTone(s: TaskStatus) {
  return s === "todo" ? "slate" : s === "in-progress" ? "blue" : "emerald";
}

export function taskPriorityLabel(p: TaskPriority): string {
  return p === "low" ? "Rendah" : p === "medium" ? "Sedang" : "Tinggi";
}

export function taskPriorityTone(p: TaskPriority) {
  return p === "low" ? "slate" : p === "medium" ? "amber" : "rose";
}

export function transactionStatusLabel(s: TransactionStatus): string {
  return s === "paid" ? "Lunas" : s === "pending" ? "Pending" : "Terlambat";
}

export function transactionStatusTone(s: TransactionStatus) {
  return s === "paid" ? "emerald" : s === "pending" ? "amber" : "rose";
}

export function revisionStatusLabel(s: RevisionStatus): string {
  return s === "requested"
    ? "Diminta"
    : s === "in-progress"
      ? "Dikerjakan"
      : "Selesai";
}

export function revisionStatusTone(s: RevisionStatus) {
  return s === "requested"
    ? "amber"
    : s === "in-progress"
      ? "blue"
      : "emerald";
}
