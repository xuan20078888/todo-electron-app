import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 认证
  register: (u: string, p: string) => ipcRenderer.invoke('register', u, p),
  login: (u: string, p: string) => ipcRenderer.invoke('login', u, p),
  logout: () => ipcRenderer.invoke('logout'),
  getCurrentUser: () => ipcRenderer.invoke('get-current-user'),

  // 待办 CRUD
  getTodos: () => ipcRenderer.invoke('get-todos'),
  addTodo: (data: any) => ipcRenderer.invoke('add-todo', data),
  updateTodo: (id: string, updates: any) => ipcRenderer.invoke('update-todo', id, updates),
  toggleTodo: (id: string) => ipcRenderer.invoke('toggle-todo', id),
  deleteTodo: (id: string) => ipcRenderer.invoke('delete-todo', id),
  clearCompleted: () => ipcRenderer.invoke('clear-completed'),

  // 置顶/备注/颜色/复制
  togglePin: (id: string) => ipcRenderer.invoke('toggle-pin', id),
  updateNotes: (id: string, notes: string) => ipcRenderer.invoke('update-notes', id, notes),
  updateColor: (id: string, color: string | null) => ipcRenderer.invoke('update-color', id, color),
  duplicateTodo: (id: string) => ipcRenderer.invoke('duplicate-todo', id),

  // 批量
  bulkToggleTodos: (ids: string[]) => ipcRenderer.invoke('bulk-toggle-todos', ids),
  bulkDeleteTodos: (ids: string[]) => ipcRenderer.invoke('bulk-delete-todos', ids),
  bulkUpdatePriority: (ids: string[], priority: string) => ipcRenderer.invoke('bulk-update-priority', ids, priority),

  // 排序
  reorderTodos: (ids: string[]) => ipcRenderer.invoke('reorder-todos', ids),

  // 回收站
  getRecycleBin: () => ipcRenderer.invoke('get-recycle-bin'),
  restoreFromRecycle: (id: string) => ipcRenderer.invoke('restore-from-recycle', id),
  permanentDelete: (id: string) => ipcRenderer.invoke('permanent-delete', id),
  emptyRecycle: () => ipcRenderer.invoke('empty-recycle'),

  // 自定义分类
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (cat: any) => ipcRenderer.invoke('add-category', cat),
  deleteCategory: (id: string) => ipcRenderer.invoke('delete-category', id),

  // 统计
  getStats: () => ipcRenderer.invoke('get-stats'),
  getWeeklyStats: () => ipcRenderer.invoke('get-weekly-stats'),
  getMonthlyStats: () => ipcRenderer.invoke('get-monthly-stats'),
  getProductivityScore: () => ipcRenderer.invoke('get-productivity-score'),
  getTagStats: () => ipcRenderer.invoke('get-tag-stats'),

  // 偏好
  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  savePreferences: (prefs: any) => ipcRenderer.invoke('save-preferences', prefs),

  // 番茄钟
  savePomodoro: (data: any) => ipcRenderer.invoke('save-pomodoro', data),
  getPomodoroHistory: () => ipcRenderer.invoke('get-pomodoro-history'),
  getPomodoroStats: () => ipcRenderer.invoke('get-pomodoro-stats'),

  // 活动日志
  getActivity: (limit?: number) => ipcRenderer.invoke('get-activity', limit),

  // 时间追踪
  startTimer: (id: string) => ipcRenderer.invoke('start-timer', id),
  stopTimer: (id: string, seconds: number) => ipcRenderer.invoke('stop-timer', id, seconds),

  // 模板
  getTemplates: () => ipcRenderer.invoke('get-templates'),
  saveTemplate: (t: any) => ipcRenderer.invoke('save-template', t),
  deleteTemplate: (id: string) => ipcRenderer.invoke('delete-template', id),

  // 导出导入
  exportData: () => ipcRenderer.invoke('export-data'),
  exportCsv: () => ipcRenderer.invoke('export-csv'),
  importData: (data: any) => ipcRenderer.invoke('import-data', data),

  // 备份
  manualBackup: () => ipcRenderer.invoke('manual-backup'),
  getBackups: () => ipcRenderer.invoke('get-backups'),
  restoreBackup: (filename: string) => ipcRenderer.invoke('restore-backup', filename),

  // 通知
  checkDueNotifications: () => ipcRenderer.invoke('check-due-notifications'),
});
