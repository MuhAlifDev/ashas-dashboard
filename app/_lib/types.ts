export type ClientStatus =
  | "active"
  | "inactive"
  | "lead"
  | "negosiasi"
  | "revisi"
  | "completed"
  | "on-hold";

export type Client = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: ClientStatus;
  deadline?: string;
  notes?: string;
  source?: string;
  createdAt: string;
};

export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "review"
  | "completed"
  | "on-hold";

export type Project = {
  id: string;
  name: string;
  clientId?: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  progress: number;
  createdAt: string;
};

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  projectId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  notes?: string;
  createdAt: string;
};

export type TransactionType = "income" | "expense";
export type TransactionStatus = "paid" | "pending" | "overdue";

export type Transaction = {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  clientId?: string;
  projectId?: string;
  status: TransactionStatus;
  date: string;
  createdAt: string;
};

export type MeetingNote = {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
};

export type RevisionStatus = "requested" | "in-progress" | "done";

export type Revision = {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: RevisionStatus;
  requestedDate: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
};

export type DailyLog = {
  id: string;
  projectId: string;
  note: string;
  date: string;
  createdAt: string;
};

export type Drawing = {
  id: string;
  name: string;
  data: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
};

export type ToolCategory =
  | "frontend"
  | "design"
  | "backend"
  | "framework"
  | "cms"
  | "asset"
  | "ai-agent"
  | "other";

export type Tool = {
  id: string;
  name: string;
  category: ToolCategory;
  description?: string;
  url?: string;
  createdAt: string;
};

export type DashboardData = {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  meetingNotes: MeetingNote[];
  revisions: Revision[];
  dailyLogs: DailyLog[];
  drawings: Drawing[];
  tools: Tool[];
};
