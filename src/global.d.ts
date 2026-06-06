export {};

type Priority = 'high' | 'medium' | 'low';
type Recurring = 'daily' | 'weekly' | 'monthly' | null;
type TodoColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | null;

interface Subtask { id: string; text: string; completed: boolean; }

interface Todo {
  id: string; text: string; description: string | null; completed: boolean;
  priority: Priority; dueDate: string | null; category: string | null;
  tags: string[]; subtasks: Subtask[]; order: number; createdAt: string;
  recurring: Recurring; timeSpent: number; completedAt: string | null;
  pinned: boolean; notes: string | null; color: TodoColor; reminder: number | null;
}

interface AuthResult { success: boolean; message: string; username?: string; }
interface ActivityLog { id: string; userId: string; action: string; target: string; detail: string; timestamp: string; }
interface PomodoroSession { id: string; userId: string; todoId: string | null; duration: number; completed: boolean; startedAt: string; }
interface Template { id: string; userId: string; name: string; text: string; priority: string; category: string | null; tags: string[]; recurring: Recurring; }
interface RecycleItem { id: string; userId: string; todo: Todo; deletedAt: string; }
interface Category { id: string; userId: string; name: string; icon: string; color: string; }
interface Stats { total: number; completed: number; overdue: number; completionRate: number; totalTimeSpent: number; categories: Record<string, { total: number; completed: number }>; priorities: Record<string, number>; dailyCompletions: { date: string; count: number }[]; }
interface WeeklyStats { total: number; completed: number; dailyData: { date: string; count: number }[]; }
interface MonthlyStats { total: number; completed: number; weeklyData: { week: string; count: number }[]; }
interface ProductivityScore { score: number; breakdown: { completion: number; onTime: number; focus: number }; }
interface TagStat { name: string; total: number; completed: number; }
interface PomodoroStats { totalSessions: number; totalMinutes: number; todaySessions: number; weekSessions: number; dailyData: { date: string; count: number }[]; }
interface BackupInfo { filename: string; path: string; size: number; time: string; }
interface UserPreferences { darkMode?: boolean; defaultCategory?: string | null; compactView?: boolean; minimizeToTray?: boolean; pomodoroWork?: number; pomodoroBreak?: number; }

interface ElectronAPI {
  register(u: string, p: string): Promise<AuthResult>;
  login(u: string, p: string): Promise<AuthResult>;
  logout(): Promise<{ success: boolean }>;
  getCurrentUser(): Promise<string | null>;
  getTodos(): Promise<Todo[]>;
  addTodo(data: Partial<Todo>): Promise<Todo>;
  updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null>;
  toggleTodo(id: string): Promise<Todo | null>;
  deleteTodo(id: string): Promise<{ success: boolean }>;
  clearCompleted(): Promise<{ success: boolean }>;
  togglePin(id: string): Promise<Todo | null>;
  updateNotes(id: string, notes: string): Promise<Todo | null>;
  updateColor(id: string, color: TodoColor): Promise<Todo | null>;
  duplicateTodo(id: string): Promise<Todo | null>;
  bulkToggleTodos(ids: string[]): Promise<{ success: boolean; count: number }>;
  bulkDeleteTodos(ids: string[]): Promise<{ success: boolean; count: number }>;
  bulkUpdatePriority(ids: string[], priority: string): Promise<{ success: boolean; count: number }>;
  reorderTodos(ids: string[]): Promise<{ success: boolean }>;
  getRecycleBin(): Promise<RecycleItem[]>;
  restoreFromRecycle(id: string): Promise<{ success: boolean }>;
  permanentDelete(id: string): Promise<{ success: boolean }>;
  emptyRecycle(): Promise<{ success: boolean }>;
  getCategories(): Promise<Category[]>;
  addCategory(cat: { name: string; icon: string; color: string }): Promise<Category | null>;
  deleteCategory(id: string): Promise<{ success: boolean }>;
  getStats(): Promise<Stats | null>;
  getWeeklyStats(): Promise<WeeklyStats | null>;
  getMonthlyStats(): Promise<MonthlyStats | null>;
  getProductivityScore(): Promise<ProductivityScore | null>;
  getTagStats(): Promise<TagStat[]>;
  getPreferences(): Promise<UserPreferences>;
  savePreferences(prefs: UserPreferences): Promise<{ success: boolean }>;
  savePomodoro(data: { todoId?: string; duration: number }): Promise<PomodoroSession>;
  getPomodoroHistory(): Promise<PomodoroSession[]>;
  getPomodoroStats(): Promise<PomodoroStats | null>;
  getActivity(limit?: number): Promise<ActivityLog[]>;
  startTimer(id: string): Promise<{ success: boolean; startedAt: number } | null>;
  stopTimer(id: string, seconds: number): Promise<Todo | null>;
  getTemplates(): Promise<Template[]>;
  saveTemplate(t: Omit<Template, 'id' | 'userId'>): Promise<Template>;
  deleteTemplate(id: string): Promise<{ success: boolean }>;
  exportData(): Promise<any>;
  exportCsv(): Promise<string | null>;
  importData(data: any): Promise<{ success: boolean; message: string }>;
  manualBackup(): Promise<{ success: boolean }>;
  getBackups(): Promise<BackupInfo[]>;
  restoreBackup(filename: string): Promise<{ success: boolean; message: string }>;
  checkDueNotifications(): Promise<{ id: string; text: string; dueDate: string }[]>;
}

declare global { interface Window { electronAPI: ElectronAPI; } }
