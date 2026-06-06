/**
 * 待办清单 - 完整渲染进程
 * 认证 | CRUD | 分类 | 标签 | 子任务 | 搜索 | 暗黑 | 拖拽 | 批量 |
 * 日历 | 统计 | 番茄钟 | 模板 | 活动日志 | 时间追踪 | 专注模式 | 导出导入 |
 * 置顶 | 备注 | 颜色标记 | 回收站 | 自定义分类 | 多种排序 | 标签筛选 |
 * CSV导出 | 备份管理 | 紧凑视图 | 打印 | 完成动画 | 生产力评分 |
 * 周/月统计 | 番茄钟统计 | 番茄钟设置 | 番茄钟关联任务 | 批量修改优先级
 */

const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);

// ===== DOM =====
const authPage=$('#authPage'), mainPage=$('#mainPage'), authTabs=$$('.auth-tab');
const loginForm=$('#loginForm'), registerForm=$('#registerForm');
const loginUsername=$('#loginUsername'), loginPassword=$('#loginPassword'), loginError=$('#loginError');
const regUsername=$('#regUsername'), regPassword=$('#regPassword'), regPasswordConfirm=$('#regPasswordConfirm');
const registerError=$('#registerError'), registerSuccess=$('#registerSuccess');
const todoInput=$('#todoInput'), addBtn=$('#addBtn'), todoList=$('#todoList');
const emptyState=$('#emptyState'), onboarding=$('#onboarding'), simpleEmpty=$('#simpleEmpty'), sampleCardsEl=$('#sampleCards'), skipOnboarding=$('#skipOnboarding');
const totalCount=$('#totalCount'), completedCount=$('#completedCount'), overdueCount=$('#overdueCount');
const usernameDisplay=$('#usernameDisplay'), logoutBtn=$('#logoutBtn'), darkModeBtn=$('#darkModeBtn'), focusModeBtn=$('#focusModeBtn'), notifyBtn=$('#notifyBtn'), compactBtn=$('#compactBtn');
const dueDateInput=$('#dueDateInput'), tagInput=$('#tagInput'), tagPillsEl=$('#tagPills'), recurringSelect=$('#recurringSelect');
const descInput=$('#descInput');
const sortBtn=$('#sortBtn'), sortMenu=$('#sortMenu'), clearCompletedBtn=$('#clearCompletedBtn');
const tagFilterBtn=$('#tagFilterBtn'), tagFilterMenu=$('#tagFilterMenu');
const searchToggle=$('#searchToggle'), searchBar=$('#searchBar'), searchInput=$('#searchInput'), searchClear=$('#searchClear');
const focusBar=$('#focusBar'), focusTask=$('#focusTask'), focusExit=$('#focusExit');
const filterTabs=$$('.filter-tabs .tab'), priorityBtns=$$('.priority-btns .p-btn'), quickDateBtns=$$('.quick-date-btn');
const viewTabs=$$('.view-tab'), toastContainer=$('#toastContainer');
const tasksView=$('#tasksView'), calendarView=$('#calendarView'), statsView=$('#statsView'), pomodoroView=$('#pomodoroView'), templatesView=$('#templatesView'), activityView=$('#activityView'), recycleView=$('#recycleView'), backupView=$('#backupView');
const calendarGrid=$('#calendarGrid'), calTitle=$('#calTitle'), calPrev=$('#calPrev'), calNext=$('#calNext');
const statsSummary=$('#statsSummary'), trendChart=$('#trendChart'), categoryChart=$('#categoryChart'), priorityChart=$('#priorityChart'), tagStatsChart=$('#tagStatsChart');
const statsTabs=$$('.stats-tab'), statsOverview=$('#statsOverview'), statsWeekly=$('#statsWeekly'), statsMonthly=$('#statsMonthly'), statsProductivity=$('#statsProductivity');
const weeklySummary=$('#weeklySummary'), weeklyChart=$('#weeklyChart'), monthlySummary=$('#monthlySummary'), monthlyChart=$('#monthlyChart');
const productivityScore=$('#productivityScore');
const pomoTime=$('#pomoTime'), pomoMode=$('#pomoMode'), pomoProgress=$('#pomoProgress');
const pomoStart=$('#pomoStart'), pomoPause=$('#pomoPause'), pomoReset=$('#pomoReset'), pomoCount=$('#pomoCount'), pomoHistory=$('#pomoHistory');
const pomoSettings=$('#pomoSettings'), pomoSettingsPanel=$('#pomoSettingsPanel'), pomoWorkDuration=$('#pomoWorkDuration'), pomoBreakDuration=$('#pomoBreakDuration'), pomoSettingsSave=$('#pomoSettingsSave');
const pomoTaskSelect=$('#pomoTaskSelect'), pomoStatsPanel=$('#pomoStatsPanel');
const templateList=$('#templateList'), templateEditor=$('#templateEditor'), addTemplateBtn=$('#addTemplateBtn');
const tplName=$('#tplName'), tplText=$('#tplText'), tplPriority=$('#tplPriority'), tplCategory=$('#tplCategory'), tplRecurring=$('#tplRecurring'), tplTags=$('#tplTags'), tplSave=$('#tplSave'), tplCancel=$('#tplCancel');
const activityList=$('#activityList');
const recycleList=$('#recycleList'), emptyRecycleBtn=$('#emptyRecycleBtn');
const backupList=$('#backupList'), manualBackupBtn=$('#manualBackupBtn');
const categoryModal=$('#categoryModal'), manageCategoriesBtn=$('#manageCategoriesBtn'), closeCatModal=$('#closeCatModal');
const newCatName=$('#newCatName'), newCatIcon=$('#newCatIcon'), newCatColor=$('#newCatColor'), addCatBtn=$('#addCatBtn'), categoryManageList=$('#categoryManageList');
const bulkBar=$('#bulkBar'), bulkCount=$('#bulkCount'), bulkComplete=$('#bulkComplete'), bulkDelete=$('#bulkDelete'), bulkSelectAll=$('#bulkSelectAll'), bulkCancel=$('#bulkCancel');
const bulkPriorityBtn=$('#bulkPriorityBtn'), bulkPriorityMenu=$('#bulkPriorityMenu');
const exportBtn=$('#exportBtn'), exportCsvBtn=$('#exportCsvBtn'), importInput=$('#importInput'), printBtn=$('#printBtn');

// ===== 颜色常量 =====
const TODO_COLORS = {
  red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e',
  blue: '#3b82f6', purple: '#8b5cf6', pink: '#ec4899'
};

// ===== 示例任务 =====
const SAMPLE_TASKS=[
  {emoji:'📧',text:'回复客户邮件',priority:'high',category:'work',dueLabel:'今天',dueDate:()=>todayStr()},
  {emoji:'💼',text:'准备明天的会议材料',priority:'medium',category:'work',dueLabel:'明天',dueDate:()=>tomorrowStr()},
  {emoji:'📝',text:'提交本周工作总结',priority:'low',category:'study',dueLabel:'下周一',dueDate:()=>nextMondayStr()},
];
const PLACEHOLDERS=['输入任务，按回车添加...','试试：明天下午3点 开会 💼','试试：每周五 提交周报 📝','试试：给妈妈买生日礼物 🎁','试试：整理桌面文件 📂'];

// ===== 状态 =====
let todos=[], currentFilter='all', selectedPriority='medium', selectedCategory='', selectedDueDate=null, selectedTags=[];
let sortMode='none', editingId=null, expandedId=null, searchQuery='', searchVisible=false;
let currentView='tasks', darkMode=false, focusMode=false, focusTodoId=null, compactView=false;
let selectedIds=new Set(), placeholderTimer=null, placeholderIdx=0;
let calMonth=new Date().getMonth(), calYear=new Date().getFullYear();
let pomo={mode:'work',secondsLeft:25*60,totalSeconds:25*60,running:false,interval:null,todoId:null,completedCount:0,workDuration:25,breakDuration:5};
let dragId=null, timerState={todoId:null,startTime:null,elapsed:0,interval:null};
let activeTagFilter=null;
let customCategories=[];
let audioCtx=null;

// ===== 工具函数 =====
function todayStr(){return new Date().toISOString().split('T')[0];}
function tomorrowStr(){const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().split('T')[0];}
function nextMondayStr(){const d=new Date();const day=d.getDay();d.setDate(d.getDate()+(day===0?1:8-day));return d.toISOString().split('T')[0];}
function daysDiff(s){if(!s)return null;const t=new Date();t.setHours(0,0,0,0);return Math.ceil((new Date(s+'T00:00:00')-t)/86400000);}
function formatDate(s){if(!s)return null;const d=daysDiff(s);if(d<0)return{text:`已逾期${Math.abs(d)}天`,cls:'overdue'};if(d===0)return{text:'今天截止',cls:'today'};if(d===1)return{text:'明天截止',cls:'soon'};if(d<=3)return{text:`${d}天后`,cls:'soon'};const dt=new Date(s+'T00:00:00');return{text:`${dt.getMonth()+1}/${dt.getDate()}`,cls:''};}
function priorityLabel(p){return{high:'高',medium:'中',low:'低'}[p]||'中';}
function categoryLabel(c){
  const builtIn={work:'💼工作',life:'🏠生活',study:'📚学习'};
  if(builtIn[c])return builtIn[c];
  const custom=customCategories.find(cat=>cat.name===c);
  return custom?`${custom.icon}${custom.name}`:c||'未分类';
}
function categoryClass(c){return{work:'cat-work',life:'cat-life',study:'cat-study'}[c]||'cat-none';}
function recurringLabel(r){return{daily:'每天',weekly:'每周',monthly:'每月'}[r]||'';}
function formatTime(secs){const m=Math.floor(secs/60),s=secs%60;return`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;}
function formatTimeLong(secs){if(secs<60)return`${secs}秒`;if(secs<3600)return`${Math.floor(secs/60)}分${secs%60}秒`;return`${Math.floor(secs/3600)}时${Math.floor((secs%3600)/60)}分`;}
function esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}

// ===== 音效 =====
function playCompletionSound(){
  try{
    if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=audioCtx.createOscillator();const gain=audioCtx.createGain();
    osc.connect(gain);gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800,audioCtx.currentTime);
    osc.frequency.setValueAtTime(1000,audioCtx.currentTime+0.1);
    gain.gain.setValueAtTime(0.3,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.3);
    osc.start(audioCtx.currentTime);osc.stop(audioCtx.currentTime+0.3);
  }catch{}
}

// ===== Toast =====
function showToast(msg,type='success',dur=3000){const t=document.createElement('div');t.className=`toast ${type}`;t.textContent=msg;toastContainer.appendChild(t);setTimeout(()=>{t.classList.add('exiting');setTimeout(()=>t.remove(),250);},dur);}

// ===== 确认弹窗 =====
function showConfirm(title,msg){return new Promise(resolve=>{const o=document.createElement('div');o.className='confirm-overlay';o.innerHTML=`<div class="confirm-dialog"><h3>${title}</h3><p>${msg}</p><div class="confirm-btns"><button class="confirm-cancel">取消</button><button class="confirm-ok">确认</button></div></div>`;document.body.appendChild(o);o.querySelector('.confirm-cancel').onclick=()=>{o.remove();resolve(false);};o.querySelector('.confirm-ok').onclick=()=>{o.remove();resolve(true);};o.addEventListener('click',e=>{if(e.target===o){o.remove();resolve(false);}});});}

// ===== 暗黑模式 =====
async function loadDarkMode(){const prefs=await window.electronAPI.getPreferences();darkMode=prefs.darkMode||false;compactView=prefs.compactView||false;applyTheme();if(compactView)document.documentElement.classList.add('compact');}
function toggleDarkMode(){darkMode=!darkMode;applyTheme();window.electronAPI.savePreferences({darkMode});}
function applyTheme(){document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');darkModeBtn.textContent=darkMode?'☀️':'🌙';}
function toggleCompact(){compactView=!compactView;document.documentElement.classList.toggle('compact',compactView);window.electronAPI.savePreferences({compactView});showToast(compactView?'📐 紧凑视图':'📐 宽松视图','info');}

// ===== 专注模式 =====
function toggleFocusMode(todoId){
  if(focusMode){focusMode=false;focusTodoId=null;focusBar.style.display='none';render();showToast('已退出专注模式','info');return;}
  if(!todoId){const active=todos.find(t=>!t.completed);if(active)todoId=active.id;}
  if(!todoId)return;
  focusMode=true;focusTodoId=todoId;
  const todo=todos.find(t=>t.id===todoId);
  focusTask.textContent=todo?`当前: ${todo.text}`:'';
  focusBar.style.display='flex';
  render();showToast('🎯 已进入专注模式','info');
}

// ===== Placeholder =====
function startPlaceholder(){todoInput.placeholder=PLACEHOLDERS[0];placeholderIdx=0;placeholderTimer=setInterval(()=>{todoInput.classList.add('placeholder-fading');setTimeout(()=>{placeholderIdx=(placeholderIdx+1)%PLACEHOLDERS.length;todoInput.placeholder=PLACEHOLDERS[placeholderIdx];todoInput.classList.remove('placeholder-fading');},300);},3000);}
function stopPlaceholder(){if(placeholderTimer){clearInterval(placeholderTimer);placeholderTimer=null;}}

// ===== 页面切换 =====
function showAuthPage(){authPage.style.display='flex';mainPage.style.display='none';stopPlaceholder();}
function showMainPage(u){authPage.style.display='none';mainPage.style.display='flex';usernameDisplay.textContent=`👤 ${u}`;startPlaceholder();}

// ===== 引导 =====
function isFirstTime(){return !localStorage.getItem('todo_onboarding_done');}
function markOnboardingDone(){localStorage.setItem('todo_onboarding_done','1');}
function renderSampleCards(){sampleCardsEl.innerHTML='';SAMPLE_TASKS.forEach(task=>{const card=document.createElement('div');card.className='sample-card';const date=typeof task.dueDate==='function'?task.dueDate():task.dueDate;card.innerHTML=`<div class="sample-card-icon">${task.emoji}</div><div class="sample-card-body"><div class="sample-card-title">${esc(task.text)}</div><div class="sample-card-meta"><span class="priority-tag ${task.priority}">${priorityLabel(task.priority)}</span><span class="due-tag">${task.dueLabel}</span></div></div><button class="sample-add-btn" data-text="${esc(task.text)}" data-priority="${task.priority}" data-category="${task.category}" data-date="${date}">+ 添加</button>`;card.querySelector('.sample-add-btn').addEventListener('click',async e=>{const btn=e.currentTarget;const todo=await window.electronAPI.addTodo({text:btn.dataset.text,priority:btn.dataset.priority,category:btn.dataset.category,dueDate:btn.dataset.date});if(todo){todos.unshift(todo);btn.textContent='✓已添加';btn.classList.add('added');render();showToast(`✅「${todo.text}」已添加`);}});sampleCardsEl.appendChild(card);});}
function showEmptyState(){emptyState.classList.add('visible');if(isFirstTime()){onboarding.style.display='flex';simpleEmpty.style.display='none';renderSampleCards();}else{onboarding.style.display='none';simpleEmpty.style.display='flex';}}
function hideEmptyState(){emptyState.classList.remove('visible');}

// ===== 标签 =====
function addTag(tag){tag=tag.trim();if(!tag||selectedTags.includes(tag))return;selectedTags.push(tag);renderTagPills();}
function removeTag(tag){selectedTags=selectedTags.filter(t=>t!==tag);renderTagPills();}
function renderTagPills(){tagPillsEl.innerHTML='';selectedTags.forEach(tag=>{const pill=document.createElement('span');pill.className='tag-pill';pill.innerHTML=`${esc(tag)} <button class="tag-remove">×</button>`;pill.querySelector('.tag-remove').addEventListener('click',()=>removeTag(tag));tagPillsEl.appendChild(pill);});}

// ===== 搜索 =====
let searchDebounce=null;
function toggleSearch(){searchVisible=!searchVisible;searchBar.style.display=searchVisible?'flex':'none';if(searchVisible)searchInput.focus();else{searchQuery='';searchInput.value='';render();}}

// ===== 视图切换 =====
function switchView(view){
  currentView=view;
  viewTabs.forEach(t=>t.classList.toggle('active',t.dataset.view===view));
  [tasksView,calendarView,statsView,pomodoroView,templatesView,activityView,recycleView,backupView].forEach(v=>v.style.display='none');
  if(view==='tasks'){tasksView.style.display='flex';render();}
  else if(view==='calendar'){calendarView.style.display='flex';renderCalendar();}
  else if(view==='stats'){statsView.style.display='flex';renderStats();}
  else if(view==='pomodoro'){pomodoroView.style.display='flex';loadPomodoroHistory();updatePomoTaskSelect();loadPomodoroStats();}
  else if(view==='templates'){templatesView.style.display='flex';renderTemplates();}
  else if(view==='activity'){activityView.style.display='flex';renderActivity();}
  else if(view==='recycle'){recycleView.style.display='flex';renderRecycleBin();}
  else if(view==='backup'){backupView.style.display='flex';renderBackups();}
}

// ===== 统计子视图切换 =====
function switchStatsView(period){
  statsTabs.forEach(t=>t.classList.toggle('active',t.dataset.period===period));
  [statsOverview,statsWeekly,statsMonthly,statsProductivity].forEach(v=>v.style.display='none');
  if(period==='overview'){statsOverview.style.display='block';renderStats();}
  else if(period==='week'){statsWeekly.style.display='block';renderWeeklyStats();}
  else if(period==='month'){statsMonthly.style.display='block';renderMonthlyStats();}
  else if(period==='productivity'){statsProductivity.style.display='block';renderProductivityScore();}
}

// ===== 时间追踪 =====
function startTimer(todoId){if(timerState.interval)stopTimer();timerState.todoId=todoId;timerState.startTime=Date.now();timerState.elapsed=0;timerState.interval=setInterval(()=>{timerState.elapsed=Math.floor((Date.now()-timerState.startTime)/1000);const el=document.querySelector(`.todo-item[data-id="${todoId}"] .timer-display`);if(el)el.textContent=formatTime(timerState.elapsed);},1000);window.electronAPI.startTimer(todoId);showToast('⏱️ 开始计时','info');}
async function stopTimer(){if(!timerState.interval)return;clearInterval(timerState.interval);const secs=timerState.elapsed;const todoId=timerState.todoId;timerState={todoId:null,startTime:null,elapsed:0,interval:null};if(secs>0){await window.electronAPI.stopTimer(todoId,secs);const idx=todos.findIndex(t=>t.id===todoId);if(idx!==-1)todos[idx].timeSpent=(todos[idx].timeSpent||0)+secs;render();showToast(`⏱️ 计时 ${formatTime(secs)}`,'info');}}

// ===== 初始化 =====
async function init(){
  dueDateInput.value=todayStr();selectedDueDate=todayStr();
  await loadDarkMode();
  await loadCustomCategories();
  const user=await window.electronAPI.getCurrentUser();
  if(user){showMainPage(user);await loadTodos();checkNotifications();}
  else{showAuthPage();}
  bindAllEvents();
}

// ===== 加载自定义分类 =====
async function loadCustomCategories(){
  try{customCategories=await window.electronAPI.getCategories();}catch{customCategories=[];}
  renderCategoryButtons();
}

function renderCategoryButtons(){
  const container=$('#categoryBtns');
  if(!container)return;
  // 保留固定的"全部"按钮和内置分类
  const builtIn=['','work','life','study'];
  container.innerHTML='';
  // 全部按钮
  const allBtn=document.createElement('button');allBtn.className=`cat-btn${selectedCategory===''?' active':''}`;allBtn.dataset.category='';allBtn.textContent='全部';container.appendChild(allBtn);
  // 内置分类
  [{cat:'work',label:'💼'},{cat:'life',label:'🏠'},{cat:'study',label:'📚'}].forEach(({cat,label})=>{const btn=document.createElement('button');btn.className=`cat-btn${selectedCategory===cat?' active':''}`;btn.dataset.category=cat;btn.textContent=label;container.appendChild(btn);});
  // 自定义分类
  customCategories.forEach(c=>{const btn=document.createElement('button');btn.className=`cat-btn${selectedCategory===c.name?' active':''}`;btn.dataset.category=c.name;btn.textContent=c.icon||'📁';btn.title=c.name;container.appendChild(btn);});
  // 绑定事件
  container.querySelectorAll('.cat-btn').forEach(btn=>btn.addEventListener('click',()=>{container.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');selectedCategory=btn.dataset.category;render();}));
}

// ===== 事件绑定 =====
function bindAllEvents(){
  // 认证
  authTabs.forEach(tab=>tab.addEventListener('click',()=>{authTabs.forEach(t=>t.classList.remove('active'));tab.classList.add('active');loginForm.style.display=tab.dataset.tab==='login'?'flex':'none';registerForm.style.display=tab.dataset.tab==='register'?'flex':'none';loginError.textContent='';registerError.textContent='';registerSuccess.textContent='';}));
  loginForm.addEventListener('submit',async e=>{e.preventDefault();loginError.textContent='';const u=loginUsername.value.trim(),p=loginPassword.value;if(!u||!p){loginError.textContent='请填写用户名和密码';return;}const res=await window.electronAPI.login(u,p);if(res.success){showMainPage(res.username);await loadTodos();await loadCustomCategories();loginUsername.value='';loginPassword.value='';showToast(`欢迎回来，${res.username}！`,'info');}else loginError.textContent=res.message;});
  registerForm.addEventListener('submit',async e=>{e.preventDefault();registerError.textContent='';registerSuccess.textContent='';const u=regUsername.value.trim(),p=regPassword.value,c=regPasswordConfirm.value;if(!u||!p||!c){registerError.textContent='请填写所有字段';return;}if(p!==c){registerError.textContent='两次密码不一致';return;}const res=await window.electronAPI.register(u,p);if(res.success){registerSuccess.textContent='注册成功！请登录';regUsername.value='';regPassword.value='';regPasswordConfirm.value='';setTimeout(()=>authTabs[0].click(),800);}else registerError.textContent=res.message;});
  logoutBtn.addEventListener('click',async()=>{await window.electronAPI.logout();todos=[];editingId=null;selectedIds.clear();focusMode=false;showAuthPage();});
  darkModeBtn.addEventListener('click',toggleDarkMode);
  compactBtn.addEventListener('click',toggleCompact);
  focusModeBtn.addEventListener('click',()=>toggleFocusMode());
  focusExit.addEventListener('click',()=>toggleFocusMode());
  notifyBtn.addEventListener('click',checkNotifications);
  // 添加
  addBtn.addEventListener('click',addTodo);todoInput.addEventListener('keypress',e=>{if(e.key==='Enter')addTodo();});
  priorityBtns.forEach(btn=>btn.addEventListener('click',()=>{priorityBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');selectedPriority=btn.dataset.priority;}));
  quickDateBtns.forEach(btn=>btn.addEventListener('click',()=>{const d=new Date();d.setDate(d.getDate()+parseInt(btn.dataset.offset));dueDateInput.value=d.toISOString().split('T')[0];selectedDueDate=dueDateInput.value;}));
  dueDateInput.addEventListener('change',e=>{selectedDueDate=e.target.value||null;});
  tagInput.addEventListener('keypress',e=>{if(e.key==='Enter'){e.preventDefault();addTag(tagInput.value);tagInput.value='';}});
  // 搜索
  searchToggle.addEventListener('click',toggleSearch);searchClear.addEventListener('click',()=>{searchQuery='';searchInput.value='';render();});searchInput.addEventListener('input',()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(()=>{searchQuery=searchInput.value.trim().toLowerCase();render();},200);});
  // 筛选
  filterTabs.forEach(tab=>tab.addEventListener('click',()=>{filterTabs.forEach(t=>t.classList.remove('active'));tab.classList.add('active');currentFilter=tab.dataset.filter;render();}));
  // 排序下拉
  sortBtn.addEventListener('click',e=>{e.stopPropagation();sortMenu.style.display=sortMenu.style.display==='none'?'block':'none';tagFilterMenu.style.display='none';});
  sortMenu.querySelectorAll('.sort-option').forEach(opt=>opt.addEventListener('click',()=>{sortMode=opt.dataset.sort;sortMenu.style.display='none';sortBtn.classList.toggle('active',sortMode!=='none');render();}));
  // 标签筛选下拉
  tagFilterBtn.addEventListener('click',e=>{e.stopPropagation();renderTagFilterMenu();tagFilterMenu.style.display=tagFilterMenu.style.display==='none'?'block':'none';sortMenu.style.display='none';});
  // 点击外部关闭下拉
  document.addEventListener('click',()=>{sortMenu.style.display='none';tagFilterMenu.style.display='none';bulkPriorityMenu.style.display='none';});
  clearCompletedBtn.addEventListener('click',async()=>{const count=todos.filter(t=>t.completed).length;if(!await showConfirm('清除已完成',`确定删除 ${count} 条？`))return;await window.electronAPI.clearCompleted();todos=todos.filter(t=>!t.completed);render();showToast(`已清除 ${count} 条`);});
  skipOnboarding.addEventListener('click',()=>{markOnboardingDone();showEmptyState();});
  // 视图
  viewTabs.forEach(tab=>tab.addEventListener('click',()=>switchView(tab.dataset.view)));
  calPrev.addEventListener('click',()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();});
  calNext.addEventListener('click',()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();});
  // 统计子视图
  statsTabs.forEach(tab=>tab.addEventListener('click',()=>switchStatsView(tab.dataset.period)));
  // 番茄钟
  pomoStart.addEventListener('click',startPomodoro);pomoPause.addEventListener('click',pausePomodoro);pomoReset.addEventListener('click',resetPomodoro);
  pomoSettings.addEventListener('click',()=>{pomoSettingsPanel.style.display=pomoSettingsPanel.style.display==='none'?'flex':'none';});
  pomoSettingsSave.addEventListener('click',savePomodoroSettings);
  // 模板
  addTemplateBtn.addEventListener('click',()=>{templateEditor.style.display=templateEditor.style.display==='none'?'flex':'none';});tplSave.addEventListener('click',saveTemplate);tplCancel.addEventListener('click',()=>{templateEditor.style.display='none';});
  // 回收站
  emptyRecycleBtn.addEventListener('click',async()=>{if(!await showConfirm('清空回收站','确定永久删除所有回收站内容？此操作不可撤销。'))return;await window.electronAPI.emptyRecycle();renderRecycleBin();showToast('回收站已清空');});
  // 备份
  manualBackupBtn.addEventListener('click',async()=>{await window.electronAPI.manualBackup();renderBackups();showToast('💾 备份完成');});
  // 分类管理
  manageCategoriesBtn.addEventListener('click',()=>{categoryModal.style.display='flex';renderCategoryManageList();});
  closeCatModal.addEventListener('click',()=>{categoryModal.style.display='none';});
  categoryModal.addEventListener('click',e=>{if(e.target===categoryModal)categoryModal.style.display='none';});
  addCatBtn.addEventListener('click',addCustomCategory);
  // 批量
  bulkComplete.addEventListener('click',bulkToggle);bulkDelete.addEventListener('click',bulkDeleteTodos);bulkSelectAll.addEventListener('click',()=>{const f=getFilteredTodos();if(selectedIds.size===f.length)selectedIds.clear();else f.forEach(t=>selectedIds.add(t.id));render();});bulkCancel.addEventListener('click',()=>{selectedIds.clear();render();});
  // 批量优先级
  bulkPriorityBtn.addEventListener('click',e=>{e.stopPropagation();bulkPriorityMenu.style.display=bulkPriorityMenu.style.display==='none'?'block':'none';});
  bulkPriorityMenu.querySelectorAll('.bulk-prio-opt').forEach(opt=>opt.addEventListener('click',async()=>{const ids=[...selectedIds];if(!ids.length)return;await window.electronAPI.bulkUpdatePriority(ids,opt.dataset.priority);ids.forEach(id=>{const t=todos.find(t=>t.id===id);if(t)t.priority=opt.dataset.priority;});bulkPriorityMenu.style.display='none';selectedIds.clear();render();showToast(`已修改 ${ids.length} 项优先级`);}));
  // 导出导入
  exportBtn.addEventListener('click',exportData);exportCsvBtn.addEventListener('click',exportCsv);importInput.addEventListener('change',importData);
  // 打印
  printBtn.addEventListener('click',()=>window.print());
  // 快捷键
  document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey){if(e.key==='f'){e.preventDefault();if(currentView==='tasks'){if(!searchVisible)toggleSearch();else searchInput.focus();}}if(e.key==='d'){e.preventDefault();toggleDarkMode();}if(e.key==='n'){e.preventDefault();switchView('tasks');todoInput.focus();}}if(e.key==='Escape'){if(editingId){editingId=null;render();}if(searchVisible)toggleSearch();if(expandedId){expandedId=null;render();}if(focusMode)toggleFocusMode();if(categoryModal.style.display==='flex')categoryModal.style.display='none';}});
}

// ===== CRUD =====
async function loadTodos(){todos=await window.electronAPI.getTodos();render();}
async function addTodo(){
  const text=todoInput.value.trim();if(!text){todoInput.focus();return;}
  const desc=descInput.value.trim()||null;
  const todo=await window.electronAPI.addTodo({text,description:desc,priority:selectedPriority,dueDate:selectedDueDate,category:selectedCategory||null,tags:[...selectedTags],recurring:recurringSelect.value||null});
  if(todo){
    todos.unshift(todo);todoInput.value='';descInput.value='';
    priorityBtns.forEach(b=>b.classList.remove('active'));priorityBtns[1].classList.add('active');selectedPriority='medium';
    dueDateInput.value=todayStr();selectedDueDate=todayStr();selectedTags=[];renderTagPills();recurringSelect.value='';
    if(isFirstTime())markOnboardingDone();render();todoInput.focus();showToast('✅ 任务添加成功');
  }
}
async function toggleTodo(id){
  const updated=await window.electronAPI.toggleTodo(id);
  const idx=todos.findIndex(t=>t.id===id);
  if(idx!==-1)todos[idx]=updated;
  // 完成动画+音效
  if(updated.completed){
    playCompletionSound();
    const el=document.querySelector(`.todo-item[data-id="${id}"]`);
    if(el){el.classList.add('completing');setTimeout(()=>el.classList.remove('completing'),600);}
  }
  render();
}
async function deleteTodo(id){await window.electronAPI.deleteTodo(id);todos=todos.filter(t=>t.id!==id);selectedIds.delete(id);if(focusTodoId===id)toggleFocusMode();render();showToast('🗑️ 已移入回收站','info');}
async function saveEdit(id,updates){const updated=await window.electronAPI.updateTodo(id,updates);const idx=todos.findIndex(t=>t.id===id);if(idx!==-1&&updated)todos[idx]=updated;editingId=null;render();showToast('✏️ 已更新','info');}
function startEdit(id){editingId=id;render();setTimeout(()=>{const inp=document.querySelector(`.todo-item[data-id="${id}"] .edit-input`);if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}},50);}
function cancelEdit(){editingId=null;render();}

// ===== 子任务 =====
async function toggleSubtask(todoId,subId){const todo=todos.find(t=>t.id===todoId);if(!todo)return;const sub=todo.subtasks.find(s=>s.id===subId);if(sub)sub.completed=!sub.completed;await window.electronAPI.updateTodo(todoId,{subtasks:todo.subtasks});render();}
async function addSubtask(todoId,text){const todo=todos.find(t=>t.id===todoId);if(!todo||!text.trim())return;todo.subtasks.push({id:uid(),text:text.trim(),completed:false});await window.electronAPI.updateTodo(todoId,{subtasks:todo.subtasks});render();}
async function deleteSubtask(todoId,subId){const todo=todos.find(t=>t.id===todoId);if(!todo)return;todo.subtasks=todo.subtasks.filter(s=>s.id!==subId);await window.electronAPI.updateTodo(todoId,{subtasks:todo.subtasks});render();}

// ===== 置顶 =====
async function togglePin(id){const updated=await window.electronAPI.togglePin(id);const idx=todos.findIndex(t=>t.id===id);if(idx!==-1&&updated)todos[idx]=updated;render();showToast(updated.pinned?'📌 已置顶':'取消置顶','info');}

// ===== 颜色标记 =====
async function setColor(id,color){const updated=await window.electronAPI.updateColor(id,color);const idx=todos.findIndex(t=>t.id===id);if(idx!==-1&&updated)todos[idx]=updated;render();}

// ===== 复制任务 =====
async function duplicateTodo(id){const newTodo=await window.electronAPI.duplicateTodo(id);if(newTodo){todos.unshift(newTodo);render();showToast('📋 任务已复制');}}

// ===== 批量 =====
async function bulkToggle(){if(!selectedIds.size)return;await window.electronAPI.bulkToggleTodos([...selectedIds]);const ids=[...selectedIds];ids.forEach(id=>{const t=todos.find(t=>t.id===id);if(t)t.completed=!t.completed;});selectedIds.clear();render();showToast(`已切换 ${ids.length} 项`);}
async function bulkDeleteTodos(){if(!selectedIds.size)return;if(!await showConfirm('批量删除',`确定删除 ${selectedIds.size} 项？`))return;const count=selectedIds.size;await window.electronAPI.bulkDeleteTodos([...selectedIds]);todos=todos.filter(t=>!selectedIds.has(t.id));selectedIds.clear();render();showToast(`已删除 ${count} 项`);}

// ===== 标签筛选 =====
function renderTagFilterMenu(){
  const allTags=new Set();todos.forEach(t=>(t.tags||[]).forEach(tag=>allTags.add(tag)));
  if(allTags.size===0){tagFilterMenu.innerHTML='<div class="tag-filter-empty">暂无标签</div>';return;}
  let html='<button class="tag-filter-opt'+(activeTagFilter===null?' active':'')+'" data-tag="">全部标签</button>';
  allTags.forEach(tag=>{html+=`<button class="tag-filter-opt${activeTagFilter===tag?' active':''}" data-tag="${esc(tag)}">${esc(tag)}</button>`;});
  tagFilterMenu.innerHTML=html;
  tagFilterMenu.querySelectorAll('.tag-filter-opt').forEach(opt=>opt.addEventListener('click',()=>{activeTagFilter=opt.dataset.tag||null;tagFilterMenu.style.display='none';render();}));
}

// ===== 番茄钟 =====
function startPomodoro(){
  if(pomo.running)return;
  pomo.running=true;pomoStart.style.display='none';pomoPause.style.display='inline-flex';
  // 获取关联任务
  const selectedTask=pomoTaskSelect.value;pomo.todoId=selectedTask||null;
  pomo.interval=setInterval(()=>{
    pomo.secondsLeft--;updatePomoDisplay();
    if(pomo.secondsLeft<=0){
      clearInterval(pomo.interval);pomo.running=false;
      playCompletionSound();
      if(pomo.mode==='work'){
        pomo.completedCount++;pomoCount.textContent=pomo.completedCount;
        window.electronAPI.savePomodoro({todoId:pomo.todoId,duration:pomo.totalSeconds});
        showToast('🍅 番茄钟完成！休息一下','success');
        pomo.mode='break';pomo.secondsLeft=pomo.breakDuration*60;pomo.totalSeconds=pomo.breakDuration*60;
      }else{
        showToast('☕ 休息结束，继续加油！','info');
        pomo.mode='work';pomo.secondsLeft=pomo.workDuration*60;pomo.totalSeconds=pomo.workDuration*60;
      }
      pomoStart.style.display='inline-flex';pomoPause.style.display='none';
      updatePomoDisplay();loadPomodoroHistory();loadPomodoroStats();
    }
  },1000);
}
function pausePomodoro(){clearInterval(pomo.interval);pomo.running=false;pomoStart.style.display='inline-flex';pomoPause.style.display='none';}
function resetPomodoro(){pausePomodoro();pomo.mode='work';pomo.secondsLeft=pomo.workDuration*60;pomo.totalSeconds=pomo.workDuration*60;updatePomoDisplay();}
function updatePomoDisplay(){pomoTime.textContent=formatTime(pomo.secondsLeft);pomoMode.textContent=pomo.mode==='work'?'专注时间':'休息时间';const progress=1-(pomo.secondsLeft/pomo.totalSeconds);pomoProgress.style.strokeDashoffset=565.48*(1-progress);pomoProgress.style.stroke=pomo.mode==='work'?'var(--primary)':'var(--success)';}
async function loadPomodoroHistory(){const sessions=await window.electronAPI.getPomodoroHistory();pomoCount.textContent=sessions.filter(s=>s.completed).length;pomoHistory.innerHTML=sessions.length?sessions.slice(0,10).map(s=>`<div class="pomo-item"><span>🍅 ${s.duration/60}分钟</span><span>${s.startedAt}</span></div>`).join(''):'<p class="pomo-empty">暂无记录</p>';}
function updatePomoTaskSelect(){const select=pomoTaskSelect;const currentVal=select.value;select.innerHTML='<option value="">不关联</option>';todos.filter(t=>!t.completed).forEach(t=>{const opt=document.createElement('option');opt.value=t.id;opt.textContent=t.text.substring(0,30);select.appendChild(opt);});select.value=currentVal;}
function savePomodoroSettings(){const work=parseInt(pomoWorkDuration.value)||25;const brk=parseInt(pomoBreakDuration.value)||5;pomo.workDuration=Math.max(1,Math.min(120,work));pomo.breakDuration=Math.max(1,Math.min(60,brk));if(!pomo.running){pomo.mode='work';pomo.secondsLeft=pomo.workDuration*60;pomo.totalSeconds=pomo.workDuration*60;updatePomoDisplay();}window.electronAPI.savePreferences({pomodoroWork:pomo.workDuration,pomodoroBreak:pomo.breakDuration});pomoSettingsPanel.style.display='none';showToast(`🍅 设置已保存：工作${pomo.workDuration}分钟，休息${pomo.breakDuration}分钟`);}
async function loadPomodoroStats(){const stats=await window.electronAPI.getPomodoroStats();if(!stats)return;pomoStatsPanel.innerHTML=`<div class="pomo-stats-grid"><div class="pomo-stat-card"><div class="pomo-stat-val">${stats.todaySessions}</div><div class="pomo-stat-label">今日</div></div><div class="pomo-stat-card"><div class="pomo-stat-val">${stats.weekSessions}</div><div class="pomo-stat-label">本周</div></div><div class="pomo-stat-card"><div class="pomo-stat-val">${stats.totalSessions}</div><div class="pomo-stat-label">总计</div></div><div class="pomo-stat-card"><div class="pomo-stat-val">${stats.totalMinutes}</div><div class="pomo-stat-label">总分钟</div></div></div>`;}

// ===== 通知 =====
async function checkNotifications(){const due=await window.electronAPI.checkDueNotifications();if(due.length>0)showToast(`🔔 你有 ${due.length} 个任务到期`,'info',5000);else showToast('✅ 没有到期任务','success');}

// ===== 模板 =====
async function renderTemplates(){const templates=await window.electronAPI.getTemplates();templateList.innerHTML=templates.length===0?'<p class="empty-text">暂无模板，点击上方新建</p>':templates.map(t=>`<div class="template-card"><div class="tpl-card-body"><div class="tpl-card-name">${esc(t.name)}</div><div class="tpl-card-desc">${esc(t.text)}</div><div class="tpl-card-meta"><span class="priority-tag ${t.priority}">${priorityLabel(t.priority)}</span>${t.category?`<span class="category-tag ${categoryClass(t.category)}">${categoryLabel(t.category)}</span>`:''}${t.recurring?`<span class="recurring-tag">${recurringLabel(t.recurring)}</span>`:''}</div></div><div class="tpl-card-actions"><button class="tpl-use-btn" data-id="${t.id}">使用</button><button class="tpl-del-btn" data-id="${t.id}">×</button></div></div>`).join('');
  templateList.querySelectorAll('.tpl-use-btn').forEach(btn=>btn.addEventListener('click',async()=>{const tpl=templates.find(t=>t.id===btn.dataset.id);if(tpl){const todo=await window.electronAPI.addTodo({text:tpl.text,priority:tpl.priority,category:tpl.category,tags:tpl.tags||[],recurring:tpl.recurring});if(todo){todos.unshift(todo);render();showToast(`✅ 从模板「${tpl.name}」创建`);}}}));
  templateList.querySelectorAll('.tpl-del-btn').forEach(btn=>btn.addEventListener('click',async()=>{await window.electronAPI.deleteTemplate(btn.dataset.id);renderTemplates();showToast('模板已删除','info');}));}
async function saveTemplate(){const name=tplName.value.trim(),text=tplText.value.trim();if(!name||!text){showToast('请填写模板名称和内容','error');return;}await window.electronAPI.saveTemplate({name,text,priority:tplPriority.value,category:tplCategory.value||null,tags:tplTags.value.split(',').map(s=>s.trim()).filter(Boolean),recurring:tplRecurring.value||null});tplName.value='';tplText.value='';tplTags.value='';templateEditor.style.display='none';renderTemplates();showToast('✅ 模板已保存');}

// ===== 活动日志 =====
async function renderActivity(){const logs=await window.electronAPI.getActivity(100);activityList.innerHTML=logs.length===0?'<p class="empty-text">暂无活动记录</p>':logs.map(l=>`<div class="activity-item"><span class="activity-action">${esc(l.action)}</span><span class="activity-target">${esc(l.target)}</span>${l.detail?`<span class="activity-detail">${esc(l.detail)}</span>`:''}<span class="activity-time">${l.timestamp}</span></div>`).join('');}

// ===== 回收站 =====
async function renderRecycleBin(){
  const items=await window.electronAPI.getRecycleBin();
  recycleList.innerHTML=items.length===0?'<p class="empty-text">回收站为空</p>':items.map(item=>`<div class="recycle-item"><div class="recycle-item-body"><div class="recycle-item-text">${esc(item.todo.text)}</div><div class="recycle-item-meta"><span class="priority-tag ${item.todo.priority}">${priorityLabel(item.todo.priority)}</span><span class="recycle-time">删除于 ${item.deletedAt}</span></div></div><div class="recycle-item-actions"><button class="restore-btn" data-id="${item.id}">恢复</button><button class="perm-del-btn" data-id="${item.id}">永久删除</button></div></div>`).join('');
  recycleList.querySelectorAll('.restore-btn').forEach(btn=>btn.addEventListener('click',async()=>{await window.electronAPI.restoreFromRecycle(btn.dataset.id);todos=await window.electronAPI.getTodos();renderRecycleBin();render();showToast('✅ 已恢复');}));
  recycleList.querySelectorAll('.perm-del-btn').forEach(btn=>btn.addEventListener('click',async()=>{if(!await showConfirm('永久删除','确定永久删除？此操作不可撤销。'))return;await window.electronAPI.permanentDelete(btn.dataset.id);renderRecycleBin();showToast('已永久删除','info');}));
}

// ===== 备份管理 =====
async function renderBackups(){
  const backups=await window.electronAPI.getBackups();
  backupList.innerHTML=backups.length===0?'<p class="empty-text">暂无备份记录</p>':backups.map(b=>`<div class="backup-item"><div class="backup-item-body"><div class="backup-item-name">📦 ${esc(b.filename)}</div><div class="backup-item-meta"><span>${b.time}</span><span>${(b.size/1024).toFixed(1)} KB</span></div></div><button class="backup-restore-btn" data-file="${esc(b.filename)}">恢复</button></div>`).join('');
  backupList.querySelectorAll('.backup-restore-btn').forEach(btn=>btn.addEventListener('click',async()=>{if(!await showConfirm('恢复备份','确定恢复此备份？当前数据将被覆盖。'))return;const res=await window.electronAPI.restoreBackup(btn.dataset.file);if(res.success){todos=await window.electronAPI.getTodos();render();showToast('✅ 备份恢复成功');}else showToast(res.message,'error');}));
}

// ===== 自定义分类管理 =====
async function renderCategoryManageList(){
  const cats=await window.electronAPI.getCategories();
  categoryManageList.innerHTML=cats.length===0?'<p class="empty-text">暂无自定义分类</p>':cats.map(c=>`<div class="cat-manage-item"><span class="cat-manage-icon" style="background:${c.color}">${c.icon}</span><span class="cat-manage-name">${esc(c.name)}</span><button class="cat-del-btn" data-id="${c.id}">×</button></div>`).join('');
  categoryManageList.querySelectorAll('.cat-del-btn').forEach(btn=>btn.addEventListener('click',async()=>{await window.electronAPI.deleteCategory(btn.dataset.id);await loadCustomCategories();renderCategoryManageList();showToast('分类已删除','info');}));
}
async function addCustomCategory(){
  const name=newCatName.value.trim();const icon=newCatIcon.value.trim()||'📁';const color=newCatColor.value;
  if(!name){showToast('请输入分类名称','error');return;}
  const cat=await window.electronAPI.addCategory({name,icon,color});
  if(cat){newCatName.value='';newCatIcon.value='';await loadCustomCategories();renderCategoryManageList();showToast(`✅ 分类「${name}」已添加`);}
  else showToast('分类名已存在','error');
}

// ===== 日历 =====
function renderCalendar(){calTitle.textContent=`${calYear} 年 ${calMonth+1} 月`;calendarGrid.innerHTML='';const firstDay=new Date(calYear,calMonth,1).getDay();const daysInMonth=new Date(calYear,calMonth+1,0).getDate();const today=todayStr();for(let i=0;i<firstDay;i++){const cell=document.createElement('div');cell.className='cal-day empty';calendarGrid.appendChild(cell);}for(let d=1;d<=daysInMonth;d++){const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const dayTodos=todos.filter(t=>t.dueDate===dateStr);const isToday=dateStr===today;const cell=document.createElement('div');cell.className=`cal-day${isToday?' today':''}${dayTodos.length?' has-tasks':''}`;cell.innerHTML=`<span class="cal-day-num">${d}</span>${dayTodos.length?`<div class="cal-dots">${dayTodos.slice(0,3).map(t=>`<span class="cal-dot ${t.priority}"></span>`).join('')}</div>`:''}`;cell.addEventListener('click',()=>{dueDateInput.value=dateStr;selectedDueDate=dateStr;switchView('tasks');showToast(`📅 ${dateStr}`,'info');});calendarGrid.appendChild(cell);}}

// ===== 统计 =====
function renderStats(){
  const total=todos.length,completed=todos.filter(t=>t.completed).length;
  const rate=total>0?Math.round((completed/total)*100):0;
  const overdue=todos.filter(t=>!t.completed&&t.dueDate&&daysDiff(t.dueDate)<0).length;
  const timeSpent=todos.reduce((s,t)=>s+(t.timeSpent||0),0);
  statsSummary.innerHTML=[{label:'总任务',value:total,icon:'📋'},{label:'已完成',value:completed,icon:'✅'},{label:'完成率',value:rate+'%',icon:'📈'},{label:'逾期',value:overdue,icon:'⚠️'},{label:'总耗时',value:formatTimeLong(timeSpent),icon:'⏱️'}].map(c=>`<div class="stats-card"><div class="sc-icon">${c.icon}</div><div class="sc-value">${c.value}</div><div class="sc-label">${c.label}</div></div>`).join('');
  // 趋势图
  const last7=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const dateStr=d.toISOString().split('T')[0];last7.push({date:`${d.getMonth()+1}/${d.getDate()}`,count:todos.filter(t=>t.completedAt&&t.completedAt.startsWith(dateStr)).length});}
  const maxC=Math.max(...last7.map(d=>d.count),1);const W=400,H=160,PX=40,PY=20;
  const pts=last7.map((d,i)=>{const x=PX+(i/6)*(W-PX*2),y=H-PY-(d.count/maxC)*(H-PY*2);return`${x},${y}`;});
  const dots=last7.map((d,i)=>{const x=PX+(i/6)*(W-PX*2),y=H-PY-(d.count/maxC)*(H-PY*2);return`<circle cx="${x}" cy="${y}" r="4" fill="var(--primary)"/><text x="${x}" y="${y-10}" text-anchor="middle" fill="var(--gray-500)" font-size="11">${d.count}</text>`;});
  const labels=last7.map((d,i)=>`<text x="${PX+(i/6)*(W-PX*2)}" y="${H-2}" text-anchor="middle" fill="var(--gray-400)" font-size="11">${d.date}</text>`);
  trendChart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><polyline points="${pts.join(' ')}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots.join('')}${labels.join('')}</svg>`;
  // 分类
  const catMap={};todos.forEach(t=>{const c=t.category||'未分类';catMap[c]=(catMap[c]||0)+1;});const catColors={work:'#6366f1',life:'#22c55e',study:'#f59e0b','未分类':'#9ca3af'};const catE=Object.entries(catMap);
  if(!catE.length)categoryChart.innerHTML='<p class="empty-text">暂无数据</p>';
  else{const totalC=catE.reduce((s,[,v])=>s+v,0);let cum=0;const segs=catE.map(([n,c])=>{const pct=(c/totalC)*100;const dash=`${pct} ${100-pct}`;const off=-cum;cum+=pct;return`<circle cx="50" cy="50" r="40" fill="none" stroke="${catColors[n]||'#9ca3af'}" stroke-width="20" stroke-dasharray="${dash}" stroke-dashoffset="${off}" transform="rotate(-90 50 50)"/>`;});const legend=catE.map(([n,c])=>`<div class="legend-item"><span class="legend-dot" style="background:${catColors[n]||'#9ca3af'}"></span>${categoryLabel(n)}: ${c}</div>`).join('');categoryChart.innerHTML=`<div class="donut-wrap"><svg viewBox="0 0 100 100" width="140" height="140">${segs.join('')}<text x="50" y="52" text-anchor="middle" fill="var(--gray-700)" font-size="14" font-weight="600">${totalC}</text></svg><div class="chart-legend">${legend}</div></div>`;}
  // 优先级
  const prioMap={high:0,medium:0,low:0};todos.forEach(t=>{if(t.priority in prioMap)prioMap[t.priority]++;});const maxP=Math.max(...Object.values(prioMap),1);const prioColors={high:'var(--danger)',medium:'var(--warning)',low:'var(--success)'};
  priorityChart.innerHTML=Object.entries(prioMap).map(([k,v])=>`<div class="bar-row"><span class="bar-label">${priorityLabel(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${(v/maxP)*100}%;background:${prioColors[k]}"></div></div><span class="bar-value">${v}</span></div>`).join('');
  // 标签统计
  renderTagStatsChart();
}

async function renderTagStatsChart(){
  const tagStats=await window.electronAPI.getTagStats();
  if(!tagStats.length){tagStatsChart.innerHTML='<p class="empty-text">暂无标签数据</p>';return;}
  const maxT=Math.max(...tagStats.map(t=>t.total),1);
  tagStatsChart.innerHTML=tagStats.slice(0,10).map(t=>`<div class="bar-row"><span class="bar-label" style="width:60px;text-align:right">${esc(t.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${(t.total/maxT)*100}%;background:var(--primary)"></div></div><span class="bar-value">${t.total}</span></div>`).join('');
}

// ===== 周统计 =====
async function renderWeeklyStats(){
  const stats=await window.electronAPI.getWeeklyStats();
  if(!stats)return;
  weeklySummary.innerHTML=[{label:'本周任务',value:stats.total,icon:'📋'},{label:'已完成',value:stats.completed,icon:'✅'}].map(c=>`<div class="stats-card"><div class="sc-icon">${c.icon}</div><div class="sc-value">${c.value}</div><div class="sc-label">${c.label}</div></div>`).join('');
  const maxC=Math.max(...stats.dailyData.map(d=>d.count),1);const W=400,H=160,PX=40,PY=20;
  const pts=stats.dailyData.map((d,i)=>{const x=PX+(i/6)*(W-PX*2),y=H-PY-(d.count/maxC)*(H-PY*2);return`${x},${y}`;});
  const dots=stats.dailyData.map((d,i)=>{const x=PX+(i/6)*(W-PX*2),y=H-PY-(d.count/maxC)*(H-PY*2);return`<circle cx="${x}" cy="${y}" r="4" fill="var(--primary)"/><text x="${x}" y="${y-10}" text-anchor="middle" fill="var(--gray-500)" font-size="11">${d.count}</text>`;});
  const labels=stats.dailyData.map((d,i)=>`<text x="${PX+(i/6)*(W-PX*2)}" y="${H-2}" text-anchor="middle" fill="var(--gray-400)" font-size="11">${d.date}</text>`);
  weeklyChart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><polyline points="${pts.join(' ')}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots.join('')}${labels.join('')}</svg>`;
}

// ===== 月统计 =====
async function renderMonthlyStats(){
  const stats=await window.electronAPI.getMonthlyStats();
  if(!stats)return;
  monthlySummary.innerHTML=[{label:'本月任务',value:stats.total,icon:'📋'},{label:'已完成',value:stats.completed,icon:'✅'}].map(c=>`<div class="stats-card"><div class="sc-icon">${c.icon}</div><div class="sc-value">${c.value}</div><div class="sc-label">${c.label}</div></div>`).join('');
  const maxC=Math.max(...stats.weeklyData.map(d=>d.count),1);const W=400,H=160,PX=50,PY=20;
  const barW=Math.min(60,(W-PX*2)/stats.weeklyData.length-10);
  monthlyChart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">${stats.weeklyData.map((d,i)=>{const x=PX+i*((W-PX*2)/stats.weeklyData.length)+((W-PX*2)/stats.weeklyData.length-barW)/2;const h=maxC>0?(d.count/maxC)*(H-PY*2):0;const y=H-PY-h;return`<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="var(--primary)" rx="4"/><text x="${x+barW/2}" y="${y-6}" text-anchor="middle" fill="var(--gray-500)" font-size="11">${d.count}</text><text x="${x+barW/2}" y="${H-4}" text-anchor="middle" fill="var(--gray-400)" font-size="11">${d.week}</text>`;}).join('')}</svg>`;
}

// ===== 生产力评分 =====
async function renderProductivityScore(){
  const data=await window.electronAPI.getProductivityScore();
  if(!data)return;
  const score=data.score;
  const circumference=2*Math.PI*60;
  const offset=circumference*(1-score/100);
  let grade='',gradeColor='';
  if(score>=90){grade='S 卓越';gradeColor='#22c55e';}
  else if(score>=75){grade='A 优秀';gradeColor='#3b82f6';}
  else if(score>=60){grade='B 良好';gradeColor='#f59e0b';}
  else if(score>=40){grade='C 一般';gradeColor='#f97316';}
  else{grade='D 待提升';gradeColor='#ef4444';}
  productivityScore.innerHTML=`<div class="score-ring-wrap"><svg class="score-ring" viewBox="0 0 140 140"><circle cx="70" cy="70" r="60" fill="none" stroke="var(--gray-200)" stroke-width="10"/><circle cx="70" cy="70" r="60" fill="none" stroke="${gradeColor}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 70 70)"/></svg><div class="score-value">${score}</div><div class="score-grade" style="color:${gradeColor}">${grade}</div></div><div class="score-breakdown"><div class="score-item"><span class="score-item-label">完成率</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${data.breakdown.completion/40*100}%;background:var(--primary)"></div></div><span class="score-item-val">${data.breakdown.completion}/40</span></div><div class="score-item"><span class="score-item-label">按时完成</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${data.breakdown.onTime/30*100}%;background:var(--success)"></div></div><span class="score-item-val">${data.breakdown.onTime}/30</span></div><div class="score-item"><span class="score-item-label">专注时间</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${data.breakdown.focus/30*100}%;background:var(--warning)"></div></div><span class="score-item-val">${data.breakdown.focus}/30</span></div></div>`;
}

// ===== 导出导入 =====
async function exportData(){const data=await window.electronAPI.exportData();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`todo-backup-${todayStr()}.json`;a.click();URL.revokeObjectURL(url);showToast('📤 数据已导出');}
async function exportCsv(){const csv=await window.electronAPI.exportCsv();if(!csv)return;const bom='﻿';const blob=new Blob([bom+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`todo-export-${todayStr()}.csv`;a.click();URL.revokeObjectURL(url);showToast('📄 CSV已导出');}
async function importData(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=async()=>{try{const data=JSON.parse(reader.result);const res=await window.electronAPI.importData(data);if(res.success){todos=await window.electronAPI.getTodos();render();showToast(res.message);}else showToast(res.message,'error');}catch{showToast('文件格式错误','error');}};reader.readAsText(file);e.target.value='';}

// ===== 过滤 =====
function getFilteredTodos(){
  let list=[...todos];
  if(focusMode)list=list.filter(t=>t.id===focusTodoId);
  if(searchQuery)list=list.filter(t=>t.text.toLowerCase().includes(searchQuery)||(t.description||'').toLowerCase().includes(searchQuery)||(t.notes||'').toLowerCase().includes(searchQuery));
  if(selectedCategory)list=list.filter(t=>t.category===selectedCategory);
  if(activeTagFilter)list=list.filter(t=>(t.tags||[]).includes(activeTagFilter));
  switch(currentFilter){case 'active':list=list.filter(t=>!t.completed);break;case 'completed':list=list.filter(t=>t.completed);break;}
  // 排序
  if(sortMode==='date-asc')list.sort((a,b)=>{const da=a.dueDate?new Date(a.dueDate).getTime():Infinity;const db=b.dueDate?new Date(b.dueDate).getTime():Infinity;return da-db;});
  else if(sortMode==='date-desc')list.sort((a,b)=>{const da=a.dueDate?new Date(a.dueDate).getTime():-Infinity;const db=b.dueDate?new Date(b.dueDate).getTime():-Infinity;return db-da;});
  else if(sortMode==='priority'){const pOrder={high:0,medium:1,low:2};list.sort((a,b)=>(pOrder[a.priority]||1)-(pOrder[b.priority]||1));}
  else if(sortMode==='created')list.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  else if(sortMode==='name')list.sort((a,b)=>a.text.localeCompare(b.text,'zh-CN'));
  // 默认：置顶优先
  if(sortMode==='none'||sortMode!=='date-asc'&&sortMode!=='date-desc'&&sortMode!=='priority'&&sortMode!=='created'&&sortMode!=='name'){
    list.sort((a,b)=>{if(a.pinned&&!b.pinned)return -1;if(!a.pinned&&b.pinned)return 1;return(a.order||0)-(b.order||0);});
  }
  return list;
}

// ===== 渲染 =====
function render(){
  const filtered=getFilteredTodos();const overdue=todos.filter(t=>!t.completed&&t.dueDate&&daysDiff(t.dueDate)<0).length;const completed=todos.filter(t=>t.completed).length;
  totalCount.textContent=todos.length;completedCount.textContent=completed;overdueCount.textContent=overdue;
  clearCompletedBtn.style.display=completed>0?'flex':'none';bulkBar.style.display=selectedIds.size>0?'flex':'none';bulkCount.textContent=`已选 ${selectedIds.size} 项`;
  if(filtered.length===0&&currentView==='tasks'){todoList.innerHTML='';showEmptyState();return;}hideEmptyState();
  todoList.innerHTML='';
  filtered.forEach(todo=>{
    const isEditing=editingId===todo.id,isExpanded=expandedId===todo.id,isSelected=selectedIds.has(todo.id);
    const colorBar=todo.color?`background:${TODO_COLORS[todo.color]||todo.color}`:'';
    const item=document.createElement('div');item.className=`todo-item ${todo.completed?'completed':''} priority-${todo.priority||'medium'}${isEditing?' editing':''}${isSelected?' selected':''}${todo.pinned?' pinned':''}`;item.dataset.id=todo.id;item.draggable=true;
    if(todo.color)item.style.setProperty('--todo-color',TODO_COLORS[todo.color]||todo.color);
    const subTotal=todo.subtasks?.length||0,subDone=todo.subtasks?.filter(s=>s.completed).length||0;
    const tagsHtml=(todo.tags||[]).map(t=>`<span class="tag-pill small">${esc(t)}</span>`).join('');
    const recurHtml=todo.recurring?`<span class="recurring-tag">${recurringLabel(todo.recurring)}</span>`:'';
    const timerHtml=todo.timeSpent?`<span class="time-tag">⏱${formatTime(todo.timeSpent)}</span>`:'';
    const isTiming=timerState.todoId===todo.id;
    const pinHtml=todo.pinned?'<span class="pin-badge">📌</span>':'';
    if(isEditing){
      item.innerHTML=`<div class="todo-checkbox" style="visibility:hidden"></div><div class="todo-content"><div class="edit-form"><input class="edit-input" type="text" value="${esc(todo.text)}"><div class="edit-options"><div class="priority-btns edit-priority"><button class="p-btn${todo.priority==='high'?' active':''}" data-priority="high"><span class="p-dot high"></span>高</button><button class="p-btn${todo.priority==='medium'?' active':''}" data-priority="medium"><span class="p-dot medium"></span>中</button><button class="p-btn${todo.priority==='low'?' active':''}" data-priority="low"><span class="p-dot low"></span>低</button></div><input type="date" class="edit-date" value="${todo.dueDate||''}"></div><textarea class="edit-desc" placeholder="添加描述...">${esc(todo.description||'')}</textarea><textarea class="edit-notes" placeholder="添加备注...">${esc(todo.notes||'')}</textarea><div class="edit-actions"><button class="edit-save-btn">保存</button><button class="edit-cancel-btn">取消</button></div></div></div>`;
      const editInput=item.querySelector('.edit-input'),editDate=item.querySelector('.edit-date'),editDesc=item.querySelector('.edit-desc'),editNotes=item.querySelector('.edit-notes');const editPrioBtns=item.querySelectorAll('.edit-priority .p-btn');let editPriority=todo.priority||'medium';
      editPrioBtns.forEach(btn=>btn.addEventListener('click',()=>{editPrioBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');editPriority=btn.dataset.priority;}));
      const doSave=()=>{const t=editInput.value.trim();if(t)saveEdit(todo.id,{text:t,priority:editPriority,dueDate:editDate.value||null,description:editDesc.value||null,notes:editNotes.value||null});else cancelEdit();};
      editInput.addEventListener('keypress',e=>{if(e.key==='Enter')doSave();});item.querySelector('.edit-save-btn').addEventListener('click',doSave);item.querySelector('.edit-cancel-btn').addEventListener('click',cancelEdit);
    }else{
      const due=formatDate(todo.dueDate);const catHtml=todo.category?`<span class="category-tag ${categoryClass(todo.category)}">${categoryLabel(todo.category)}</span>`:'';
      const descPreview=todo.description?`<div class="todo-desc-preview">${esc(todo.description).substring(0,60)}${todo.description.length>60?'...':''}</div>`:'';
      const notesPreview=todo.notes?`<div class="todo-notes-preview">📝 ${esc(todo.notes).substring(0,40)}${todo.notes.length>40?'...':''}</div>`:'';
      const colorDot=todo.color?`<span class="color-dot" style="background:${TODO_COLORS[todo.color]}"></span>`:'';
      let detailHtml='';
      if(isExpanded){
        const subtasksHtml=(todo.subtasks||[]).map(s=>`<div class="subtask-item${s.completed?' completed':''}"><div class="subtask-check" data-sub="${s.id}">${s.completed?'✓':''}</div><span class="subtask-text">${esc(s.text)}</span><button class="subtask-delete" data-sub="${s.id}">×</button></div>`).join('');
        const colorPickerHtml=Object.entries(TODO_COLORS).map(([name,color])=>`<button class="color-pick-btn${todo.color===name?' active':''}" data-color="${name}" style="background:${color}" title="${name}"></button>`).join('');
        detailHtml=`<div class="todo-detail"><textarea class="detail-desc" data-id="${todo.id}" placeholder="添加描述...">${esc(todo.description||'')}</textarea><textarea class="detail-notes" data-id="${todo.id}" placeholder="添加备注...">${esc(todo.notes||'')}</textarea><div class="detail-colors"><span class="option-label">颜色</span><button class="color-pick-btn${!todo.color?' active':''}" data-color="" title="无颜色">✕</button>${colorPickerHtml}</div><div class="detail-subtasks"><div class="subtask-list">${subtasksHtml}</div><input class="subtask-input" placeholder="添加子任务，按回车" data-id="${todo.id}"></div></div>`;
      }
      item.innerHTML=`<div class="drag-handle" title="拖拽排序">⋮⋮</div><div class="todo-checkbox${isSelected?' checked':''}" data-check="select">${isSelected?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>':''}</div><div class="todo-main" data-action="expand"><div class="todo-title">${pinHtml}${colorDot}${esc(todo.text)}</div>${descPreview}${notesPreview}<div class="todo-badges"><span class="priority-tag ${todo.priority||'medium'}">${priorityLabel(todo.priority)}</span>${catHtml}${due?`<span class="due-tag ${due.cls}">${due.text}</span>`:''}${recurHtml}${timerHtml}${tagsHtml}${subTotal?`<span class="subtask-progress">${subDone}/${subTotal}</span>`:''}${isTiming?'<span class="timer-display" style="color:var(--primary);font-weight:600;">'+formatTime(timerState.elapsed)+'</span>':''}</div></div><div class="todo-actions"><button class="action-btn pin" title="${todo.pinned?'取消置顶':'置顶'}">${todo.pinned?'📌':'📍'}</button><button class="action-btn timer" title="计时">${isTiming?'⏹':'⏱'}</button><button class="action-btn focus" title="专注">🎯</button><button class="action-btn copy" title="复制">📋</button><button class="action-btn edit" title="编辑">✏️</button><button class="action-btn delete" title="删除">🗑</button></div>${detailHtml}`;
      item.querySelector('[data-check="select"]').addEventListener('click',e=>{e.stopPropagation();if(selectedIds.has(todo.id))selectedIds.delete(todo.id);else selectedIds.add(todo.id);render();});
      item.querySelector('[data-action="expand"]').addEventListener('click',()=>{expandedId=expandedId===todo.id?null:todo.id;render();});
      item.querySelector('.action-btn.pin').addEventListener('click',()=>togglePin(todo.id));
      item.querySelector('.action-btn.timer').addEventListener('click',()=>{if(timerState.todoId===todo.id)stopTimer();else startTimer(todo.id);});
      item.querySelector('.action-btn.focus').addEventListener('click',()=>toggleFocusMode(todo.id));
      item.querySelector('.action-btn.copy').addEventListener('click',()=>duplicateTodo(todo.id));
      item.querySelector('.action-btn.edit').addEventListener('click',()=>startEdit(todo.id));
      item.querySelector('.action-btn.delete').addEventListener('click',()=>deleteTodo(todo.id));
      if(isExpanded){
        item.querySelectorAll('.subtask-check').forEach(el=>el.addEventListener('click',()=>toggleSubtask(todo.id,el.dataset.sub)));
        item.querySelectorAll('.subtask-delete').forEach(el=>el.addEventListener('click',()=>deleteSubtask(todo.id,el.dataset.sub)));
        const subInput=item.querySelector('.subtask-input');if(subInput)subInput.addEventListener('keypress',e=>{if(e.key==='Enter'){addSubtask(todo.id,subInput.value);subInput.value='';}});
        const descArea=item.querySelector('.detail-desc');if(descArea)descArea.addEventListener('blur',()=>{window.electronAPI.updateTodo(todo.id,{description:descArea.value});const idx=todos.findIndex(t=>t.id===todo.id);if(idx!==-1)todos[idx].description=descArea.value;});
        const notesArea=item.querySelector('.detail-notes');if(notesArea)notesArea.addEventListener('blur',()=>{window.electronAPI.updateNotes(todo.id,notesArea.value);const idx=todos.findIndex(t=>t.id===todo.id);if(idx!==-1)todos[idx].notes=notesArea.value;});
        item.querySelectorAll('.color-pick-btn').forEach(btn=>btn.addEventListener('click',()=>{const c=btn.dataset.color||null;setColor(todo.id,c);}));
      }
      item.addEventListener('dragstart',e=>{dragId=todo.id;item.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
      item.addEventListener('dragend',()=>{item.classList.remove('dragging');dragId=null;});
      item.addEventListener('dragover',e=>{e.preventDefault();item.classList.add('drag-over');});
      item.addEventListener('dragleave',()=>item.classList.remove('drag-over'));
      item.addEventListener('drop',async e=>{e.preventDefault();item.classList.remove('drag-over');if(!dragId||dragId===todo.id)return;const from=todos.findIndex(t=>t.id===dragId),to=todos.findIndex(t=>t.id===todo.id);if(from===-1||to===-1)return;const [moved]=todos.splice(from,1);todos.splice(to,0,moved);await window.electronAPI.reorderTodos(todos.map(t=>t.id));render();});
    }
    todoList.appendChild(item);
  });
}

// ===== 启动 =====
init();
