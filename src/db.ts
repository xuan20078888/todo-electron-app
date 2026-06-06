/**
 * 数据库模块 - MySQL
 * 封装所有数据库操作
 */

import * as mysql from 'mysql2/promise';

// ==================== 连接配置 ====================
// 从环境变量读取数据库配置，避免硬编码敏感信息
// 请在项目根目录创建 .env 文件或设置系统环境变量
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todo_app',
  charset: 'utf8mb4',
};

let pool: mysql.Pool;

// ==================== 初始化 ====================
export async function initDatabase() {
  pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  // 测试连接
  const conn = await pool.getConnection();
  conn.release();
  console.log('[DB] MySQL 连接成功');
}

// ==================== 通用查询 ====================
async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

// ==================== ID 生成 ====================
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ==================== 用户 ====================
interface UserRow {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE username = ?', [username]);
}

export async function createUser(id: string, username: string, passwordHash: string, salt: string, createdAt: string) {
  await execute(
    'INSERT INTO users (id, username, passwordHash, salt, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, username, passwordHash, salt, createdAt]
  );
}

// ==================== 待办 ====================
interface TodoRow {
  id: string;
  userId: string;
  text: string;
  description: string | null;
  completed: number;
  priority: string;
  dueDate: string | null;
  category: string | null;
  tags: string; // JSON
  subtasks: string; // JSON
  order: number;
  createdAt: string;
  recurring: string | null;
  timeSpent: number;
  completedAt: string | null;
  pinned: number;
  notes: string | null;
  color: string | null;
  reminder: number | null;
}

function parseTodo(row: TodoRow) {
  return {
    id: row.id,
    userId: row.userId,
    text: row.text,
    description: row.description,
    completed: !!row.completed,
    priority: row.priority,
    dueDate: row.dueDate,
    category: row.category,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    subtasks: typeof row.subtasks === 'string' ? JSON.parse(row.subtasks) : (row.subtasks || []),
    order: row.order,
    createdAt: row.createdAt,
    recurring: row.recurring,
    timeSpent: row.timeSpent,
    completedAt: row.completedAt,
    pinned: !!row.pinned,
    notes: row.notes,
    color: row.color,
    reminder: row.reminder,
  };
}

export async function getTodos(userId: string) {
  const rows = await query<TodoRow>('SELECT * FROM todos WHERE userId = ? ORDER BY `order`', [userId]);
  return rows.map(parseTodo);
}

export async function addTodo(todo: any) {
  await execute(
    `INSERT INTO todos (id, userId, text, description, completed, priority, dueDate, category, tags, subtasks, \`order\`, createdAt, recurring, timeSpent, completedAt, pinned, notes, color, reminder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      todo.id, todo.userId, todo.text, todo.description || null, todo.completed ? 1 : 0,
      todo.priority, todo.dueDate || null, todo.category || null,
      JSON.stringify(todo.tags || []), JSON.stringify(todo.subtasks || []),
      todo.order, todo.createdAt, todo.recurring || null, todo.timeSpent || 0,
      todo.completedAt || null, todo.pinned ? 1 : 0, todo.notes || null,
      todo.color || null, todo.reminder ?? null,
    ]
  );
}

export async function updateTodo(id: string, userId: string, updates: Record<string, any>) {
  const allowed = ['text', 'description', 'completed', 'priority', 'dueDate', 'category', 'tags', 'subtasks', 'order', 'recurring', 'timeSpent', 'completedAt', 'pinned', 'notes', 'color', 'reminder'];
  const setClauses: string[] = [];
  const params: any[] = [];
  for (const key of allowed) {
    if (key in updates) {
      let val = updates[key];
      if (key === 'completed' || key === 'pinned') val = val ? 1 : 0;
      if (key === 'tags' || key === 'subtasks') val = JSON.stringify(val);
      setClauses.push(`\`${key}\` = ?`);
      params.push(val);
    }
  }
  if (setClauses.length === 0) return null;
  params.push(id, userId);
  await execute(`UPDATE todos SET ${setClauses.join(', ')} WHERE id = ? AND userId = ?`, params);
}

export async function getTodoById(id: string, userId: string) {
  return queryOne<TodoRow>('SELECT * FROM todos WHERE id = ? AND userId = ?', [id, userId]);
}

export async function deleteTodo(id: string, userId: string) {
  await execute('DELETE FROM todos WHERE id = ? AND userId = ?', [id, userId]);
}

export async function clearCompleted(userId: string) {
  await execute('DELETE FROM todos WHERE userId = ? AND completed = 1', [userId]);
}

export async function bulkToggleTodos(ids: string[], userId: string) {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const [result] = await pool.execute(
    `UPDATE todos SET completed = NOT completed, completedAt = IF(completed, NULL, ?) WHERE id IN (${placeholders}) AND userId = ?`,
    [new Date().toLocaleString('zh-CN'), ...ids, userId]
  );
  return (result as mysql.ResultSetHeader).affectedRows;
}

export async function bulkDeleteTodos(ids: string[], userId: string) {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const todos = await query<TodoRow>(
    `SELECT * FROM todos WHERE id IN (${placeholders}) AND userId = ?`,
    [...ids, userId]
  );
  await execute(`DELETE FROM todos WHERE id IN (${placeholders}) AND userId = ?`, [...ids, userId]);
  return todos.map(parseTodo);
}

export async function bulkUpdatePriority(ids: string[], priority: string, userId: string) {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const [result] = await pool.execute(
    `UPDATE todos SET priority = ? WHERE id IN (${placeholders}) AND userId = ?`,
    [priority, ...ids, userId]
  );
  return (result as mysql.ResultSetHeader).affectedRows;
}

export async function reorderTodos(orderedIds: string[], userId: string) {
  for (let i = 0; i < orderedIds.length; i++) {
    await execute('UPDATE todos SET `order` = ? WHERE id = ? AND userId = ?', [i + 1, orderedIds[i], userId]);
  }
}

// ==================== 回收站 ====================
interface RecycleRow {
  id: string;
  userId: string;
  todoData: string; // JSON
  deletedAt: string;
}

export async function getRecycleBin(userId: string) {
  const rows = await query<RecycleRow>('SELECT * FROM recycle_bin WHERE userId = ? ORDER BY deletedAt DESC', [userId]);
  return rows.map(r => ({
    id: r.id,
    userId: r.userId,
    todo: typeof r.todoData === 'string' ? JSON.parse(r.todoData) : r.todoData,
    deletedAt: r.deletedAt,
  }));
}

export async function addToRecycleBin(id: string, userId: string, todo: any, deletedAt: string) {
  await execute('INSERT INTO recycle_bin (id, userId, todoData, deletedAt) VALUES (?, ?, ?, ?)', [id, userId, JSON.stringify(todo), deletedAt]);
}

export async function getRecycleItem(id: string, userId: string) {
  const row = await queryOne<RecycleRow>('SELECT * FROM recycle_bin WHERE id = ? AND userId = ?', [id, userId]);
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    todo: typeof row.todoData === 'string' ? JSON.parse(row.todoData) : row.todoData,
    deletedAt: row.deletedAt,
  };
}

export async function deleteRecycleItem(id: string, userId: string) {
  await execute('DELETE FROM recycle_bin WHERE id = ? AND userId = ?', [id, userId]);
}

export async function emptyRecycle(userId: string) {
  await execute('DELETE FROM recycle_bin WHERE userId = ?', [userId]);
}

// 限制回收站数量（保留最新100条）
export async function trimRecycleBin(userId: string) {
  await execute(
    'DELETE FROM recycle_bin WHERE userId = ? AND id NOT IN (SELECT id FROM (SELECT id FROM recycle_bin WHERE userId = ? ORDER BY deletedAt DESC LIMIT 100) AS t)',
    [userId, userId]
  );
}

// ==================== 分类 ====================
interface CategoryRow {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
}

export async function getCategories(userId: string) {
  return query<CategoryRow>('SELECT * FROM categories WHERE userId = ?', [userId]);
}

export async function addCategory(id: string, userId: string, name: string, icon: string, color: string) {
  const existing = await queryOne<CategoryRow>('SELECT * FROM categories WHERE userId = ? AND name = ?', [userId, name]);
  if (existing) return null;
  await execute('INSERT INTO categories (id, userId, name, icon, color) VALUES (?, ?, ?, ?, ?)', [id, userId, name, icon, color]);
  return { id, userId, name, icon, color };
}

export async function deleteCategory(id: string, userId: string) {
  await execute('DELETE FROM categories WHERE id = ? AND userId = ?', [id, userId]);
}

// ==================== 偏好 ====================
export async function getPreferences(userId: string) {
  const row = await queryOne<{ prefs: string }>('SELECT prefs FROM preferences WHERE userId = ?', [userId]);
  if (!row) return { darkMode: false };
  return typeof row.prefs === 'string' ? JSON.parse(row.prefs) : row.prefs;
}

export async function savePreferences(userId: string, prefs: Record<string, any>) {
  const existing = await queryOne<{ prefs: string }>('SELECT prefs FROM preferences WHERE userId = ?', [userId]);
  let merged: Record<string, any>;
  if (existing) {
    const old = typeof existing.prefs === 'string' ? JSON.parse(existing.prefs) : existing.prefs;
    merged = { ...old, ...prefs };
    await execute('UPDATE preferences SET prefs = ? WHERE userId = ?', [JSON.stringify(merged), userId]);
  } else {
    merged = prefs;
    await execute('INSERT INTO preferences (userId, prefs) VALUES (?, ?)', [userId, JSON.stringify(merged)]);
  }
}

// ==================== 番茄钟 ====================
interface PomodoroRow {
  id: string;
  userId: string;
  todoId: string | null;
  duration: number;
  completed: number;
  startedAt: string;
}

export async function savePomodoro(id: string, userId: string, todoId: string | null, duration: number, startedAt: string) {
  await execute(
    'INSERT INTO pomodoro_sessions (id, userId, todoId, duration, completed, startedAt) VALUES (?, ?, ?, ?, 1, ?)',
    [id, userId, todoId, duration, startedAt]
  );
  // 限制每用户100条
  await execute(
    'DELETE FROM pomodoro_sessions WHERE userId = ? AND id NOT IN (SELECT id FROM (SELECT id FROM pomodoro_sessions WHERE userId = ? ORDER BY startedAt DESC LIMIT 100) AS t)',
    [userId, userId]
  );
}

export async function getPomodoroHistory(userId: string) {
  return query<PomodoroRow>('SELECT * FROM pomodoro_sessions WHERE userId = ? ORDER BY startedAt DESC LIMIT 20', [userId]);
}

export async function getPomodoroStats(userId: string) {
  const all = await query<PomodoroRow>('SELECT * FROM pomodoro_sessions WHERE userId = ?', [userId]);
  const completed = all.filter(s => s.completed).length;
  const totalMinutes = Math.round(all.reduce((s, r) => s + (r.duration || 0), 0) / 60);

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = all.filter(s => s.startedAt && s.startedAt.includes(today)).length;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekSessions = all.filter(s => {
    if (!s.startedAt) return false;
    const d = new Date(s.startedAt);
    return d >= weekStart;
  }).length;

  const dailyData: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyData.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count: all.filter(s => s.startedAt && s.startedAt.includes(dateStr)).length,
    });
  }

  return { totalSessions: completed, totalMinutes, todaySessions, weekSessions, dailyData };
}

// ==================== 活动日志 ====================
interface ActivityRow {
  id: string;
  userId: string;
  action: string;
  target: string;
  detail: string;
  timestamp: string;
}

export async function logActivity(userId: string, action: string, target: string, detail: string = '') {
  const id = genId();
  const timestamp = new Date().toLocaleString('zh-CN');
  await execute(
    'INSERT INTO activity_logs (id, userId, action, target, detail, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, action, target, detail, timestamp]
  );
  // 限制200条
  await execute(
    'DELETE FROM activity_logs WHERE userId = ? AND id NOT IN (SELECT id FROM (SELECT id FROM activity_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT 200) AS t)',
    [userId, userId]
  );
}

export async function getActivityLog(userId: string, limit: number = 50) {
  return query<ActivityRow>('SELECT * FROM activity_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT ?', [userId, limit]);
}

// ==================== 模板 ====================
interface TemplateRow {
  id: string;
  userId: string;
  name: string;
  text: string;
  priority: string;
  category: string | null;
  tags: string; // JSON
  recurring: string | null;
}

export async function getTemplates(userId: string) {
  const rows = await query<TemplateRow>('SELECT * FROM templates WHERE userId = ?', [userId]);
  return rows.map(r => ({
    ...r,
    tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []),
  }));
}

export async function addTemplate(id: string, userId: string, data: any) {
  await execute(
    'INSERT INTO templates (id, userId, name, text, priority, category, tags, recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, data.name, data.text, data.priority || 'medium', data.category || null, JSON.stringify(data.tags || []), data.recurring || null]
  );
}

export async function deleteTemplate(id: string, userId: string) {
  await execute('DELETE FROM templates WHERE id = ? AND userId = ?', [id, userId]);
}

// ==================== 统计 ====================
export async function getStats(userId: string) {
  const todos = await query<TodoRow>('SELECT * FROM todos WHERE userId = ?', [userId]);
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const today = new Date().toISOString().split('T')[0];
  const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;
  const totalTimeSpent = todos.reduce((s, t) => s + (t.timeSpent || 0), 0);

  const catMap: Record<string, { total: number; completed: number }> = {};
  todos.forEach(t => {
    const c = t.category || '未分类';
    if (!catMap[c]) catMap[c] = { total: 0, completed: 0 };
    catMap[c].total++;
    if (t.completed) catMap[c].completed++;
  });

  const prioMap = { high: 0, medium: 0, low: 0 };
  todos.forEach(t => {
    if (t.priority in prioMap) prioMap[t.priority as keyof typeof prioMap]++;
  });

  const dailyCompletions: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyCompletions.push({
      date: dateStr,
      count: todos.filter(t => t.completedAt && t.completedAt.startsWith(dateStr)).length,
    });
  }

  return {
    total, completed, overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalTimeSpent, categories: catMap, priorities: prioMap, dailyCompletions,
  };
}

export async function getWeeklyStats(userId: string) {
  const todos = await query<TodoRow>('SELECT * FROM todos WHERE userId = ?', [userId]);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekTodos = todos.filter(t => new Date(t.createdAt) >= weekStart);
  const completed = weekTodos.filter(t => t.completed).length;
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const dailyData: { date: string; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dailyData.push({
      date: `周${dayNames[i]}`,
      count: todos.filter(t => t.completedAt && t.completedAt.startsWith(dateStr)).length,
    });
  }
  return { total: weekTodos.length, completed, dailyData };
}

export async function getMonthlyStats(userId: string) {
  const todos = await query<TodoRow>('SELECT * FROM todos WHERE userId = ?', [userId]);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTodos = todos.filter(t => new Date(t.createdAt) >= monthStart);
  const completed = monthTodos.filter(t => t.completed).length;
  const weeksInMonth = Math.ceil((now.getDate() + monthStart.getDay()) / 7);
  const weeklyData: { week: string; count: number }[] = [];
  for (let w = 0; w < weeksInMonth; w++) {
    const weekStart = new Date(monthStart);
    weekStart.setDate(1 + w * 7 - monthStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    weeklyData.push({
      week: `第${w + 1}周`,
      count: todos.filter(t => t.completedAt && new Date(t.completedAt) >= weekStart && new Date(t.completedAt) < weekEnd).length,
    });
  }
  return { total: monthTodos.length, completed, weeklyData };
}

export async function getProductivityScore(userId: string) {
  const todos = await query<TodoRow>('SELECT * FROM todos WHERE userId = ?', [userId]);
  const total = todos.length;
  if (total === 0) return { score: 0, breakdown: { completion: 0, onTime: 0, focus: 0 } };
  const completed = todos.filter(t => t.completed).length;
  const today = new Date().toISOString().split('T')[0];
  const totalTimeSpent = todos.reduce((s, t) => s + (t.timeSpent || 0), 0);
  const completionScore = Math.round((completed / total) * 40);
  const withDueDate = todos.filter(t => t.dueDate);
  const onTimeCompleted = withDueDate.filter(t => t.completed && t.completedAt && t.dueDate && t.completedAt.split(' ')[0] <= t.dueDate).length;
  const onTimeScore = withDueDate.length > 0 ? Math.round((onTimeCompleted / withDueDate.length) * 30) : 15;
  const focusScore = Math.min(30, Math.round((totalTimeSpent / 3600) * 2));
  return { score: Math.min(100, completionScore + onTimeScore + focusScore), breakdown: { completion: completionScore, onTime: onTimeScore, focus: focusScore } };
}

export async function getTagStats(userId: string) {
  const todos = await query<TodoRow>('SELECT * FROM todos WHERE userId = ?', [userId]);
  const tagMap: Record<string, { total: number; completed: number }> = {};
  todos.forEach(t => {
    const tags = typeof t.tags === 'string' ? JSON.parse(t.tags) : (t.tags || []);
    tags.forEach((tag: string) => {
      if (!tagMap[tag]) tagMap[tag] = { total: 0, completed: 0 };
      tagMap[tag].total++;
      if (t.completed) tagMap[tag].completed++;
    });
  });
  return Object.entries(tagMap).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total);
}

// ==================== 备份（保留文件备份功能）====================
export async function getBackupData(userId: string) {
  const todos = await getTodos(userId);
  return { todos, backedUpAt: new Date().toLocaleString('zh-CN') };
}

export async function restoreBackup(userId: string, todos: any[]) {
  // 清空现有数据，插入备份数据
  await execute('DELETE FROM todos WHERE userId = ?', [userId]);
  for (const todo of todos) {
    await addTodo({ ...todo, userId });
  }
}

// ==================== 通知检查 ====================
export async function getDueTodos(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  return query<TodoRow>(
    'SELECT * FROM todos WHERE userId = ? AND completed = 0 AND dueDate IS NOT NULL AND dueDate <= ?',
    [userId, today]
  );
}

export async function getReminderTodos(userId: string) {
  return query<TodoRow>(
    'SELECT * FROM todos WHERE userId = ? AND completed = 0 AND dueDate IS NOT NULL AND reminder IS NOT NULL',
    [userId]
  );
}
