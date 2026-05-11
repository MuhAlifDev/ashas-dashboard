import type { Client, Project, Transaction } from "./types";

export function getProjectDeadline(
  project: Project,
  clients: Client[],
): string | undefined {
  if (!project.clientId) return undefined;
  const client = clients.find((c) => c.id === project.clientId);
  return client?.deadline;
}

/**
 * Sum of expense transactions tied to a project that count against the
 * budget envelope. Includes paid + pending (anything not "overdue") so the
 * "Sisa Budget" already reserves money for in-flight expenses.
 */
export function getProjectExpenses(
  project: Project,
  transactions: Transaction[],
): number {
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.projectId === project.id &&
        t.status !== "overdue",
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getProjectBudgetRemaining(
  project: Project,
  transactions: Transaction[],
): number | null {
  if (project.budget === undefined) return null;
  return project.budget - getProjectExpenses(project, transactions);
}

/** Actually-received income for a project (status = paid). */
export function getProjectIncomePaid(
  project: Project,
  transactions: Transaction[],
): number {
  return transactions
    .filter(
      (t) =>
        t.type === "income" &&
        t.projectId === project.id &&
        t.status === "paid",
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Actually-paid expenses for a project (status = paid). */
export function getProjectExpensesPaid(
  project: Project,
  transactions: Transaction[],
): number {
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.projectId === project.id &&
        t.status === "paid",
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Net cash position for a project = paid income − paid expenses. Can be negative. */
export function getProjectNetCash(
  project: Project,
  transactions: Transaction[],
): number {
  return (
    getProjectIncomePaid(project, transactions) -
    getProjectExpensesPaid(project, transactions)
  );
}

/** Aggregated budget snapshot for a single project. */
export type ProjectBudgetSnapshot = {
  budget: number | undefined;
  incomePaid: number;
  expensesPaid: number;
  expensesCommitted: number;
  netCash: number;
  budgetRemaining: number | null;
};

export function getProjectBudgetSnapshot(
  project: Project,
  transactions: Transaction[],
): ProjectBudgetSnapshot {
  const incomePaid = getProjectIncomePaid(project, transactions);
  const expensesPaid = getProjectExpensesPaid(project, transactions);
  const expensesCommitted = getProjectExpenses(project, transactions);
  return {
    budget: project.budget,
    incomePaid,
    expensesPaid,
    expensesCommitted,
    netCash: incomePaid - expensesPaid,
    budgetRemaining:
      project.budget === undefined
        ? null
        : project.budget - expensesCommitted,
  };
}

/** Roll up multiple project snapshots into a single summary. */
export function rollupBudgetSnapshots(
  snapshots: ProjectBudgetSnapshot[],
): ProjectBudgetSnapshot {
  let totalBudget = 0;
  let hasBudget = false;
  let incomePaid = 0;
  let expensesPaid = 0;
  let expensesCommitted = 0;
  for (const s of snapshots) {
    if (s.budget !== undefined) {
      totalBudget += s.budget;
      hasBudget = true;
    }
    incomePaid += s.incomePaid;
    expensesPaid += s.expensesPaid;
    expensesCommitted += s.expensesCommitted;
  }
  return {
    budget: hasBudget ? totalBudget : undefined,
    incomePaid,
    expensesPaid,
    expensesCommitted,
    netCash: incomePaid - expensesPaid,
    budgetRemaining: hasBudget ? totalBudget - expensesCommitted : null,
  };
}
