/**
 * 待办清单 - 主进程
 * MySQL 数据库存储
 * 功能：认证、CRUD、批量、排序、统计、偏好、番茄钟、
 *       循环任务、活动日志、时间追踪、模板、通知、导出导入、
 *       置顶、备注、颜色标记、回收站、自定义分类、CSV导出、
 *       自动备份、番茄钟统计、生产力评分、标签统计、定时提醒
 */

import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as db from './db';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// ==================== 备份目录 ====================
const userDataPath = app.getPath('userData');
const backupDir = path.join(userDataPath, 'data', 'backups');

function ensureBackupDir() {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
}

// ==================== 密码工具 ====================
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// ==================== 当前用户 ====================
let currentUser: { id: string; username: string } | null = null;

// ==================== ID 生成 ====================
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ==================== 格式化 todo ====================
function formatTodo(t: any) {
  return {
    id: t.id, text: t.text, description: t.description || null, completed: t.completed,
    priority: t.priority, dueDate: t.dueDate || null, category: t.category || null,
    tags: t.tags || [], subtasks: t.subtasks || [], order: t.order || 0,
    recurring: t.recurring || null, timeSpent: t.timeSpent || 0,
    completedAt: t.completedAt || null, createdAt: t.createdAt,
    pinned: t.pinned || false, notes: t.notes || null,
    color: t.color || null, reminder: t.reminder ?? null,
  };
}

// ==================== 窗口 ====================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960, height: 720, minWidth: 520, minHeight: 580,
    title: '待办清单',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
    autoHideMenuBar: true, backgroundColor: '#f9fafb',
  });
  mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
  // 最小化到托盘
  (mainWindow as any).on('minimize', async (e: any) => {
    if (!currentUser) return;
    const prefs = await db.getPreferences(currentUser.id);
    if (prefs.minimizeToTray) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });
}

// ==================== 系统托盘 ====================
function createTray() {
  try {
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示主窗口', click: () => { mainWindow?.show(); } },
      { type: 'separator' },
      { label: '退出', click: () => { app.quit(); } }
    ]);
    tray.setToolTip('待办清单');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => { mainWindow?.show(); });
  } catch {}
}

// ==================== 自动备份 ====================
async function autoBackup() {
  if (!currentUser) return;
  try {
    ensureBackupDir();
    const data = await db.getBackupData(currentUser.id);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `${currentUser.id}_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');
    // 清理超过30天的备份
    const files = fs.readdirSync(backupDir).filter(f => f.startsWith(currentUser!.id));
    if (files.length > 30) {
      files.sort();
      const toDelete = files.slice(0, files.length - 30);
      toDelete.forEach(f => { try { fs.unlinkSync(path.join(backupDir, f)); } catch {} });
    }
  } catch {}
}

// ==================== 循环任务日期计算 ====================
function getNextDueDate(currentDue: string | null, recurring: string): string {
  const d = currentDue ? new Date(currentDue + 'T00:00:00') : new Date();
  if (recurring === 'daily') d.setDate(d.getDate() + 1);
  else if (recurring === 'weekly') d.setDate(d.getDate() + 7);
  else if (recurring === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

// ==================== IPC: 认证 ====================
ipcMain.handle('register', async (_e, username: string, password: string) => {
  if (username.length < 2 || username.length > 20) return { success: false, message: '用户名长度需在 2-20 个字符之间' };
  if (password.length < 4) return { success: false, message: '密码长度至少 4 个字符' };
  const existing = await db.findUserByUsername(username);
  if (existing) return { success: false, message: '用户名已存在' };
  const salt = crypto.randomBytes(16).toString('hex');
  const id = genId();
  await db.createUser(id, username, hashPassword(password, salt), salt, new Date().toLocaleString('zh-CN'));
  return { success: true, message: '注册成功' };
});

ipcMain.handle('login', async (_e, username: string, password: string) => {
  const user = await db.findUserByUsername(username);
  if (!user) return { success: false, message: '用户名不存在' };
  if (hashPassword(password, user.salt) !== user.passwordHash) return { success: false, message: '密码错误' };
  currentUser = { id: user.id, username: user.username };
  return { success: true, message: '登录成功', username };
});

ipcMain.handle('logout', async () => {
  await autoBackup();
  currentUser = null;
  return { success: true };
});
ipcMain.handle('get-current-user', () => currentUser?.username || null);

// ==================== IPC: 待办 CRUD ====================
ipcMain.handle('get-todos', async () => {
  if (!currentUser) return [];
  const todos = await db.getTodos(currentUser.id);
  return todos.map(formatTodo);
});

ipcMain.handle('add-todo', async (_e, data: any) => {
  if (!currentUser) return null;
  const todos = await db.getTodos(currentUser.id);
  const maxOrder = todos.length > 0 ? Math.max(...todos.map((t: any) => t.order || 0)) : 0;
  const todo = {
    id: genId(), userId: currentUser.id, text: data.text, description: data.description || null,
    completed: false, priority: data.priority || 'medium', dueDate: data.dueDate || null,
    category: data.category || null, tags: data.tags || [], subtasks: data.subtasks || [],
    order: maxOrder + 1, createdAt: new Date().toLocaleString('zh-CN'),
    recurring: data.recurring || null, timeSpent: 0, completedAt: null,
    pinned: false, notes: data.notes || null, color: data.color || null, reminder: data.reminder ?? null,
  };
  await db.addTodo(todo);
  await db.logActivity(currentUser.id, '创建', data.text);
  return formatTodo(todo);
});

ipcMain.handle('update-todo', async (_e, id: string, updates: Record<string, any>) => {
  if (!currentUser) return null;
  await db.updateTodo(id, currentUser.id, updates);
  const todo = await db.getTodoById(id, currentUser.id);
  if (!todo) return null;
  await db.logActivity(currentUser.id, '更新', todo.text);
  return formatTodo(todo);
});

ipcMain.handle('toggle-todo', async (_e, id: string) => {
  if (!currentUser) return null;
  const todo = await db.getTodoById(id, currentUser.id);
  if (!todo) return null;
  const newCompleted = !todo.completed;
  const newCompletedAt = newCompleted ? new Date().toLocaleString('zh-CN') : null;
  await db.updateTodo(id, currentUser.id, { completed: newCompleted, completedAt: newCompletedAt });

  // 循环任务：完成后自动创建下一个
  if (newCompleted && todo.recurring) {
    const nextDue = getNextDueDate(todo.dueDate, todo.recurring);
    const newTodo = {
      id: genId(), userId: currentUser.id, text: todo.text, description: todo.description,
      completed: false, priority: todo.priority, dueDate: nextDue,
      category: todo.category, tags: typeof todo.tags === 'string' ? JSON.parse(todo.tags) : (todo.tags || []),
      subtasks: typeof todo.subtasks === 'string' ? JSON.parse(todo.subtasks) : (todo.subtasks || []),
      order: 0, createdAt: new Date().toLocaleString('zh-CN'),
      recurring: todo.recurring, timeSpent: 0, completedAt: null,
      pinned: false, notes: todo.notes, color: todo.color, reminder: todo.reminder,
    };
    await db.addTodo(newTodo);
    await db.logActivity(currentUser.id, '循环创建', todo.text, `下次: ${nextDue}`);
  }

  await db.logActivity(currentUser.id, newCompleted ? '完成' : '取消完成', todo.text);
  const updated = await db.getTodoById(id, currentUser.id);
  return formatTodo(updated);
});

// 删除任务移到回收站
ipcMain.handle('delete-todo', async (_e, id: string) => {
  if (!currentUser) return { success: false };
  const todo = await db.getTodoById(id, currentUser.id);
  if (todo) {
    await db.addToRecycleBin(genId(), currentUser.id, todo, new Date().toLocaleString('zh-CN'));
    await db.trimRecycleBin(currentUser.id);
    await db.logActivity(currentUser.id, '删除(移入回收站)', todo.text);
  }
  await db.deleteTodo(id, currentUser.id);
  return { success: true };
});

ipcMain.handle('clear-completed', async () => {
  if (!currentUser) return { success: false };
  await db.clearCompleted(currentUser.id);
  await db.logActivity(currentUser.id, '清除已完成', '');
  return { success: true };
});

// ==================== IPC: 置顶 ====================
ipcMain.handle('toggle-pin', async (_e, id: string) => {
  if (!currentUser) return null;
  const todo = await db.getTodoById(id, currentUser.id);
  if (!todo) return null;
  const newPinned = !todo.pinned;
  await db.updateTodo(id, currentUser.id, { pinned: newPinned });
  await db.logActivity(currentUser.id, newPinned ? '置顶' : '取消置顶', todo.text);
  const updated = await db.getTodoById(id, currentUser.id);
  return formatTodo(updated);
});

// ==================== IPC: 备注 ====================
ipcMain.handle('update-notes', async (_e, id: string, notes: string) => {
  if (!currentUser) return null;
  await db.updateTodo(id, currentUser.id, { notes });
  const todo = await db.getTodoById(id, currentUser.id);
  if (!todo) return null;
  return formatTodo(todo);
});

// ==================== IPC: 颜色标记 ====================
ipcMain.handle('update-color', async (_e, id: string, color: string | null) => {
  if (!currentUser) return null;
  await db.updateTodo(id, currentUser.id, { color });
  const todo = await db.getTodoById(id, currentUser.id);
  if (!todo) return null;
  return formatTodo(todo);
});

// ==================== IPC: 复制任务 ====================
ipcMain.handle('duplicate-todo', async (_e, id: string) => {
  if (!currentUser) return null;
  const todo = await db.getTodoById(id, currentUser.id);
  if (!todo) return null;
  const todos = await db.getTodos(currentUser.id);
  const maxOrder = todos.length > 0 ? Math.max(...todos.map((t: any) => t.order || 0)) : 0;
  const tags = typeof todo.tags === 'string' ? JSON.parse(todo.tags) : (todo.tags || []);
  const subtasks = (typeof todo.subtasks === 'string' ? JSON.parse(todo.subtasks) : (todo.subtasks || [])).map((s: any) => ({ ...s, id: genId(), completed: false }));
  const newTodo = {
    id: genId(), userId: currentUser.id, text: todo.text, description: todo.description,
    completed: false, priority: todo.priority, dueDate: todo.dueDate,
    category: todo.category, tags, subtasks,
    order: maxOrder + 1, createdAt: new Date().toLocaleString('zh-CN'),
    recurring: todo.recurring, timeSpent: 0, completedAt: null,
    pinned: false, notes: todo.notes, color: todo.color, reminder: todo.reminder,
  };
  await db.addTodo(newTodo);
  await db.logActivity(currentUser.id, '复制', todo.text);
  return formatTodo(newTodo);
});

// ==================== IPC: 批量操作 ====================
ipcMain.handle('bulk-toggle-todos', async (_e, ids: string[]) => {
  if (!currentUser) return { success: false };
  const count = await db.bulkToggleTodos(ids, currentUser.id);
  await db.logActivity(currentUser.id, '批量切换', `${count} 条`);
  return { success: true, count };
});

ipcMain.handle('bulk-delete-todos', async (_e, ids: string[]) => {
  if (!currentUser) return { success: false };
  const todos = await db.bulkDeleteTodos(ids, currentUser.id);
  // 移到回收站
  for (const todo of todos) {
    await db.addToRecycleBin(genId(), currentUser.id, todo, new Date().toLocaleString('zh-CN'));
  }
  await db.trimRecycleBin(currentUser.id);
  await db.logActivity(currentUser.id, '批量删除', `${todos.length} 条`);
  return { success: true, count: todos.length };
});

ipcMain.handle('bulk-update-priority', async (_e, ids: string[], priority: string) => {
  if (!currentUser) return { success: false };
  const count = await db.bulkUpdatePriority(ids, priority, currentUser.id);
  await db.logActivity(currentUser.id, '批量修改优先级', `${count} 条 → ${priority}`);
  return { success: true, count };
});

// ==================== IPC: 排序 ====================
ipcMain.handle('reorder-todos', async (_e, orderedIds: string[]) => {
  if (!currentUser) return { success: false };
  await db.reorderTodos(orderedIds, currentUser.id);
  return { success: true };
});

// ==================== IPC: 回收站 ====================
ipcMain.handle('get-recycle-bin', async () => {
  if (!currentUser) return [];
  return db.getRecycleBin(currentUser.id);
});

ipcMain.handle('restore-from-recycle', async (_e, recycleId: string) => {
  if (!currentUser) return { success: false };
  const item = await db.getRecycleItem(recycleId, currentUser.id);
  if (!item) return { success: false };
  await db.addTodo({ ...item.todo, userId: currentUser.id });
  await db.deleteRecycleItem(recycleId, currentUser.id);
  await db.logActivity(currentUser.id, '从回收站恢复', item.todo.text);
  return { success: true };
});

ipcMain.handle('permanent-delete', async (_e, recycleId: string) => {
  if (!currentUser) return { success: false };
  const item = await db.getRecycleItem(recycleId, currentUser.id);
  await db.deleteRecycleItem(recycleId, currentUser.id);
  if (item) await db.logActivity(currentUser.id, '永久删除', item.todo.text);
  return { success: true };
});

ipcMain.handle('empty-recycle', async () => {
  if (!currentUser) return { success: false };
  await db.emptyRecycle(currentUser.id);
  await db.logActivity(currentUser.id, '清空回收站', '');
  return { success: true };
});

// ==================== IPC: 自定义分类 ====================
ipcMain.handle('get-categories', async () => {
  if (!currentUser) return [];
  return db.getCategories(currentUser.id);
});

ipcMain.handle('add-category', async (_e, cat: { name: string; icon: string; color: string }) => {
  if (!currentUser) return null;
  const result = await db.addCategory(genId(), currentUser.id, cat.name, cat.icon, cat.color);
  if (result) await db.logActivity(currentUser.id, '添加分类', cat.name);
  return result;
});

ipcMain.handle('delete-category', async (_e, catId: string) => {
  if (!currentUser) return { success: false };
  await db.deleteCategory(catId, currentUser.id);
  return { success: true };
});

// ==================== IPC: 统计 ====================
ipcMain.handle('get-stats', async () => {
  if (!currentUser) return null;
  return db.getStats(currentUser.id);
});

ipcMain.handle('get-weekly-stats', async () => {
  if (!currentUser) return null;
  return db.getWeeklyStats(currentUser.id);
});

ipcMain.handle('get-monthly-stats', async () => {
  if (!currentUser) return null;
  return db.getMonthlyStats(currentUser.id);
});

// ==================== IPC: 生产力评分 ====================
ipcMain.handle('get-productivity-score', async () => {
  if (!currentUser) return null;
  return db.getProductivityScore(currentUser.id);
});

// ==================== IPC: 标签统计 ====================
ipcMain.handle('get-tag-stats', async () => {
  if (!currentUser) return [];
  return db.getTagStats(currentUser.id);
});

// ==================== IPC: 偏好 ====================
ipcMain.handle('get-preferences', async () => {
  if (!currentUser) return {};
  return db.getPreferences(currentUser.id);
});

ipcMain.handle('save-preferences', async (_e, prefs: Record<string, any>) => {
  if (!currentUser) return { success: false };
  await db.savePreferences(currentUser.id, prefs);
  return { success: true };
});

// ==================== IPC: 番茄钟 ====================
ipcMain.handle('save-pomodoro', async (_e, data: { todoId?: string; duration: number }) => {
  if (!currentUser) return null;
  const id = genId();
  const startedAt = new Date().toLocaleString('zh-CN');
  await db.savePomodoro(id, currentUser.id, data.todoId || null, data.duration, startedAt);
  await db.logActivity(currentUser.id, '番茄钟', `${data.duration / 60}分钟`);
  return { id, userId: currentUser.id, todoId: data.todoId || null, duration: data.duration, completed: true, startedAt };
});

ipcMain.handle('get-pomodoro-history', async () => {
  if (!currentUser) return [];
  return db.getPomodoroHistory(currentUser.id);
});

// ==================== IPC: 番茄钟统计 ====================
ipcMain.handle('get-pomodoro-stats', async () => {
  if (!currentUser) return null;
  return db.getPomodoroStats(currentUser.id);
});

// ==================== IPC: 活动日志 ====================
ipcMain.handle('get-activity-log', async (_e, limit: number = 50) => {
  if (!currentUser) return [];
  return db.getActivityLog(currentUser.id, limit);
});

// ==================== IPC: 时间追踪 ====================
ipcMain.handle('start-timer', async (_e, todoId: string) => {
  if (!currentUser) return null;
  await db.logActivity(currentUser.id, '开始计时', todoId);
  return { success: true, startedAt: Date.now() };
});

ipcMain.handle('stop-timer', async (_e, todoId: string, seconds: number) => {
  if (!currentUser) return null;
  const todo = await db.getTodoById(todoId, currentUser.id);
  if (todo) {
    const newTimeSpent = (todo.timeSpent || 0) + seconds;
    await db.updateTodo(todoId, currentUser.id, { timeSpent: newTimeSpent });
    await db.logActivity(currentUser.id, '停止计时', todo.text, `${Math.floor(seconds / 60)}分钟`);
    const updated = await db.getTodoById(todoId, currentUser.id);
    return formatTodo(updated);
  }
  return null;
});

// ==================== IPC: 模板 ====================
ipcMain.handle('get-templates', async () => {
  if (!currentUser) return [];
  return db.getTemplates(currentUser.id);
});

ipcMain.handle('save-template', async (_e, template: any) => {
  if (!currentUser) return null;
  const id = genId();
  await db.addTemplate(id, currentUser.id, template);
  await db.logActivity(currentUser.id, '保存模板', template.name);
  return { ...template, id, userId: currentUser.id };
});

ipcMain.handle('delete-template', async (_e, id: string) => {
  if (!currentUser) return { success: false };
  await db.deleteTemplate(id, currentUser.id);
  return { success: true };
});

// ==================== IPC: 导出导入 ====================
ipcMain.handle('export-data', async () => {
  if (!currentUser) return null;
  const todos = await db.getTodos(currentUser.id);
  const pomodoro = await db.getPomodoroHistory(currentUser.id);
  const templates = await db.getTemplates(currentUser.id);
  const activity = await db.getActivityLog(currentUser.id, 200);
  return { version: 3, exportedAt: new Date().toLocaleString('zh-CN'), user: currentUser.username, todos, pomodoro, templates, activity };
});

ipcMain.handle('export-csv', async () => {
  if (!currentUser) return null;
  const todos = await db.getTodos(currentUser.id);
  const header = 'ID,任务,描述,优先级,分类,截止日期,标签,完成状态,已用时间(秒),创建时间,完成时间,置顶,备注,颜色';
  const rows = todos.map((t: any) => {
    const tags = (t.tags || []).join(';');
    const desc = (t.description || '').replace(/"/g, '""');
    const notes = (t.notes || '').replace(/"/g, '""');
    const text = t.text.replace(/"/g, '""');
    return `"${t.id}","${text}","${desc}","${t.priority}","${t.category || ''}","${t.dueDate || ''}","${tags}","${t.completed ? '是' : '否'}","${t.timeSpent || 0}","${t.createdAt}","${t.completedAt || ''}","${t.pinned ? '是' : '否'}","${notes}","${t.color || ''}"`;
  });
  return header + '\n' + rows.join('\n');
});

ipcMain.handle('import-data', async (_e, data: any) => {
  if (!currentUser || !data || !data.todos) return { success: false, message: '数据格式错误' };
  await db.restoreBackup(currentUser.id, data.todos);
  await db.logActivity(currentUser.id, '导入数据', `${data.todos.length} 条任务`);
  return { success: true, message: `成功导入 ${data.todos.length} 条任务` };
});

// ==================== IPC: 自动备份 ====================
ipcMain.handle('manual-backup', async () => {
  if (!currentUser) return { success: false };
  await autoBackup();
  await db.logActivity(currentUser.id, '手动备份', '成功');
  return { success: true };
});

ipcMain.handle('get-backups', () => {
  if (!currentUser) return [];
  try {
    ensureBackupDir();
    const files = fs.readdirSync(backupDir).filter(f => f.startsWith(currentUser!.id));
    return files.sort().reverse().slice(0, 20).map(f => ({
      filename: f,
      path: path.join(backupDir, f),
      size: fs.statSync(path.join(backupDir, f)).size,
      time: f.replace(currentUser!.id + '_', '').replace('.json', '').replace(/T/, ' ').replace(/-/g, (m, offset) => offset < 13 ? m : ':').slice(0, 19),
    }));
  } catch { return []; }
});

ipcMain.handle('restore-backup', async (_e, filename: string) => {
  if (!currentUser) return { success: false };
  try {
    ensureBackupDir();
    const filePath = path.join(backupDir, filename);
    if (!fs.existsSync(filePath)) return { success: false, message: '备份文件不存在' };
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data || !data.todos) return { success: false, message: '备份数据格式错误' };
    await db.restoreBackup(currentUser.id, data.todos);
    await db.logActivity(currentUser.id, '恢复备份', filename);
    return { success: true, message: '备份恢复成功' };
  } catch { return { success: false, message: '恢复失败' }; }
});

// ==================== IPC: 桌面通知 ====================
ipcMain.handle('check-due-notifications', async () => {
  if (!currentUser) return [];
  const dueTodos = await db.getDueTodos(currentUser.id);
  if (dueTodos.length > 0) {
    try {
      new Notification({
        title: '📋 待办提醒',
        body: `你有 ${dueTodos.length} 个任务已到期或即将到期`,
        silent: false,
      }).show();
    } catch {}
  }
  return dueTodos.map((t: any) => ({ id: t.id, text: t.text, dueDate: t.dueDate }));
});

// ==================== IPC: 活动日志 ====================
ipcMain.handle('get-activity', async (_e, limit = 50) => {
  if (!currentUser) return [];
  return db.getActivityLog(currentUser.id, limit);
});

// ==================== 定时提醒检查 ====================
async function checkReminders() {
  if (!currentUser || !mainWindow) return;
  const todos = await db.getReminderTodos(currentUser.id);
  const now = new Date();
  for (const t of todos) {
    if (!t.dueDate || !t.reminder) continue;
    const dueDate = new Date(t.dueDate + 'T23:59:59');
    const reminderTime = new Date(dueDate.getTime() - t.reminder * 60000);
    const diff = reminderTime.getTime() - now.getTime();
    if (diff >= -300000 && diff <= 60000) {
      try {
        new Notification({
          title: '⏰ 任务提醒',
          body: `「${t.text}」将在${t.reminder >= 60 ? Math.floor(t.reminder / 60) + '小时' : t.reminder + '分钟后'}到期`,
          silent: false,
        }).show();
      } catch {}
    }
  }
}

// ==================== 应用生命周期 ====================
app.whenReady().then(async () => {
  try {
    await db.initDatabase();
    console.log('[App] 数据库初始化完成');
  } catch (err) {
    console.error('[App] 数据库连接失败:', err);
    // 可以选择弹窗提示用户
  }
  ensureBackupDir();
  createWindow();
  createTray();
  // 启动时检查逾期通知
  setTimeout(async () => {
    if (currentUser) await checkDueNotifications();
  }, 3000);
  // 每分钟检查提醒
  setInterval(checkReminders, 60000);
});

async function checkDueNotifications() {
  if (!currentUser) return;
  const dueTodos = await db.getDueTodos(currentUser.id);
  if (dueTodos.length > 0) {
    try {
      new Notification({
        title: '📋 待办提醒',
        body: `你有 ${dueTodos.length} 个任务已到期或即将到期`,
        silent: false,
      }).show();
    } catch {}
  }
}

app.on('window-all-closed', async () => {
  await autoBackup();
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
