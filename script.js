// --- Theme Management (Fixed) ---
const themeToggle = document.getElementById('theme-toggle');
let currentTheme = localStorage.getItem('theme') || 'light';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

applyTheme(currentTheme);

themeToggle.onclick = () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
};

// --- Notifications System ---
let notificationsEnabled = localStorage.getItem('notifications') !== 'false';
const notificationToggle = document.getElementById('notifications-toggle');
notificationToggle.textContent = notificationsEnabled ? '🔔' : '🔕';

notificationToggle.onclick = () => {
  notificationsEnabled = !notificationsEnabled;
  localStorage.setItem('notifications', notificationsEnabled);
  notificationToggle.textContent = notificationsEnabled ? '🔔' : '🔕';
  showNotification(notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled');
};

function showNotification(message, duration = 3000) {
  if (!notificationsEnabled) return;
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, duration);
}

// --- Daily Quote ---
const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "Productivity is never an accident.", author: "Paul J. Meyer" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" }
];

function setDailyQuote() {
  const today = new Date().toISOString().slice(0, 10);
  const hash = today.split('-').reduce((acc, cur) => acc + parseInt(cur, 10), 0);
  const idx = hash % quotes.length;
  document.getElementById('quote').textContent = `"${quotes[idx].text}"`;
  document.getElementById('author').textContent = `— ${quotes[idx].author}`;
}
setDailyQuote();

// --- AI Task Suggestions ---
const aiSuggestions = [
  "Review and organize your email inbox",
  "Plan tomorrow's priorities",
  "Take a 10-minute walk for mental clarity",
  "Update your project documentation",
  "Schedule important meetings for next week",
  "Clean and organize your workspace",
  "Review your monthly goals progress",
  "Learn something new for 15 minutes",
  "Connect with a colleague or friend",
  "Practice a skill you want to improve"
];

document.getElementById('ai-suggest').onclick = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'ai-suggestions';
  modal.innerHTML = `
    <h3>🤖 AI Task Suggestions</h3>
    <div id="suggestions-list"></div>
    <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 16px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer;">Close</button>
  `;
  
  const suggestionsList = modal.querySelector('#suggestions-list');
  const randomSuggestions = aiSuggestions.sort(() => 0.5 - Math.random()).slice(0, 5);
  
  randomSuggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = suggestion;
    item.onclick = () => {
      document.getElementById('todo-input').value = suggestion;
      overlay.remove();
      showNotification('Task suggestion added!');
    };
    suggestionsList.appendChild(item);
  });
  
  overlay.onclick = (e) => e.target === overlay && overlay.remove();
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.classList.add('show');
    modal.classList.add('show');
  }, 100);
};

// --- Enhanced To-Do List ---
const todoInput = document.getElementById('todo-input');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskCount = document.getElementById('task-count');
const progressFill = document.getElementById('progress-fill');

let todos = JSON.parse(localStorage.getItem('todos-v3')) || [];
let currentFilter = 'all';

function renderTodos() {
  todoList.innerHTML = '';
  const filtered = todos.filter(todo => currentFilter === 'all' || todo.category === currentFilter);
  
  filtered.forEach((todo, idx) => {
    const originalIdx = todos.indexOf(todo);
    const li = document.createElement('li');
    li.className = todo.done ? 'completed' : '';
    
    const content = document.createElement('div');
    content.className = 'task-content';
    
    const text = document.createElement('div');
    text.className = 'task-text';
    text.textContent = todo.text;
    text.style.cursor = 'pointer';
    text.onclick = () => toggleTodo(originalIdx);
    
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    
    const categorySpan = document.createElement('span');
    categorySpan.className = 'task-category';
    categorySpan.textContent = getCategoryIcon(todo.category) + ' ' + todo.category;
    
    const prioritySpan = document.createElement('span');
    prioritySpan.className = `task-priority priority-${todo.priority}`;
    prioritySpan.textContent = todo.priority.toUpperCase();
    
    meta.appendChild(categorySpan);
    meta.appendChild(prioritySpan);
    content.appendChild(text);
    content.appendChild(meta);
    li.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '🗑️';
    delBtn.title = 'Delete';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTodo(originalIdx);
    };
    actions.appendChild(delBtn);

    li.appendChild(actions);
    todoList.appendChild(li);
  });
  
  updateTaskStats();
}

function getCategoryIcon(category) {
  const icons = { work: '💼', personal: '🏠', health: '💪', learning: '📚' };
  return icons[category] || '📝';
}

function updateTaskStats() {
  const completed = todos.filter(t => t.done).length;
  const total = todos.length;
  taskCount.textContent = `${completed}/${total}`;
  progressFill.style.width = total ? `${(completed/total)*100}%` : '0%';
}

function saveTodos() {
  localStorage.setItem('todos-v3', JSON.stringify(todos));
  updateAnalytics();
}

function addTodo(text, category, priority) {
  todos.push({ 
    text, 
    done: false, 
    category, 
    priority, 
    createdAt: new Date().toISOString(),
    completedAt: null 
  });
  saveTodos();
  renderTodos();
  showNotification('Task added successfully!');
}

function toggleTodo(idx) {
  todos[idx].done = !todos[idx].done;
  todos[idx].completedAt = todos[idx].done ? new Date().toISOString() : null;
  saveTodos();
  renderTodos();
  if (todos[idx].done) showNotification('Task completed! 🎉');
}

function deleteTodo(idx) {
  todos.splice(idx, 1);
  saveTodos();
  renderTodos();
  showNotification('Task deleted');
}

todoForm.onsubmit = function(e) {
  e.preventDefault();
  const val = todoInput.value.trim();
  if (val) {
    addTodo(val, taskCategory.value, taskPriority.value);
    todoInput.value = '';
  }
};

filterBtns.forEach(btn => {
  btn.onclick = () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  };
});

// --- Habit Tracker ---
let habits = JSON.parse(localStorage.getItem('habits')) || [];

function renderHabits() {
  const habitsList = document.getElementById('habits-list');
  habitsList.innerHTML = '';
  
  habits.forEach((habit, idx) => {
    const item = document.createElement('div');
    item.className = 'habit-item';
    
    const name = document.createElement('span');
    name.textContent = habit.name;
    
    const streak = document.createElement('div');
    streak.className = 'habit-streak';
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      const day = document.createElement('div');
      day.className = 'habit-day';
      day.textContent = date.getDate();
      
      if (habit.completedDates && habit.completedDates.includes(dateStr)) {
        day.classList.add('completed');
      }
      
      day.onclick = () => toggleHabitDay(idx, dateStr);
      streak.appendChild(day);
    }
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.onclick = () => deleteHabit(idx);
    deleteBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--danger);';
    
    item.appendChild(name);
    item.appendChild(streak);
    item.appendChild(deleteBtn);
    habitsList.appendChild(item);
  });
}

function toggleHabitDay(habitIdx, date) {
  if (!habits[habitIdx].completedDates) habits[habitIdx].completedDates = [];
  
  const dateIndex = habits[habitIdx].completedDates.indexOf(date);
  if (dateIndex > -1) {
    habits[habitIdx].completedDates.splice(dateIndex, 1);
  } else {
    habits[habitIdx].completedDates.push(date);
  }
  
  localStorage.setItem('habits', JSON.stringify(habits));
  renderHabits();
}

function deleteHabit(idx) {
  habits.splice(idx, 1);
  localStorage.setItem('habits', JSON.stringify(habits));
  renderHabits();
}

document.getElementById('add-habit').onclick = () => {
  const input = document.getElementById('habit-input');
  const name = input.value.trim();
  if (name) {
    habits.push({ name, completedDates: [] });
    localStorage.setItem('habits', JSON.stringify(habits));
    input.value = '';
    renderHabits();
    showNotification('Habit added!');
  }
};

// --- Focus Mode ---
let focusTime = 0;
let focusInterval = null;
let focusSessions = parseInt(localStorage.getItem('focus-sessions')) || 0;
let totalFocusTime = parseInt(localStorage.getItem('total-focus-time')) || 0;

document.getElementById('focus-sessions').textContent = focusSessions;
document.getElementById('total-focus-time').textContent = `${Math.floor(totalFocusTime/60)}h ${totalFocusTime%60}m`;

function updateFocusTimer() {
  const minutes = Math.floor(focusTime / 60);
  const seconds = focusTime % 60;
  document.getElementById('focus-timer').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

document.getElementById('focus-toggle').onclick = function() {
  if (focusInterval) {
    clearInterval(focusInterval);
    focusInterval = null;
    this.textContent = 'Start Focus';
    this.classList.remove('active');
    
    if (focusTime > 0) {
      focusSessions++;
      totalFocusTime += Math.floor(focusTime / 60);
      localStorage.setItem('focus-sessions', focusSessions);
      localStorage.setItem('total-focus-time', totalFocusTime);
      
      document.getElementById('focus-sessions').textContent = focusSessions;
      document.getElementById('total-focus-time').textContent = `${Math.floor(totalFocusTime/60)}h ${totalFocusTime%60}m`;
      document.getElementById('focus-time').textContent = `${Math.floor(totalFocusTime/60)}h`;
      
      showNotification(`Focus session completed! ${Math.floor(focusTime/60)} minutes`);
    }
    focusTime = 0;
    updateFocusTimer();
  } else {
    focusInterval = setInterval(() => {
      focusTime++;
      updateFocusTimer();
    }, 1000);
    this.textContent = 'Stop Focus';
    this.classList.add('active');
  }
};

// --- Enhanced Pomodoro Timer ---
let pomoMinutes = 25;
let pomoSeconds = 0;
let pomoInterval = null;
let isPomoActive = false;
let pomoSessions = parseInt(localStorage.getItem('pomo-sessions')) || 0;
let currentMode = 'work';
let sessionCount = 0;

const minutesEl = document.getElementById('pomo-minutes');
const secondsEl = document.getElementById('pomo-seconds');
const startBtn = document.getElementById('start-pomo');
const pauseBtn = document.getElementById('pause-pomo');
const resetBtn = document.getElementById('reset-pomo');
const pomoModeEl = document.getElementById('pomo-mode');
const pomoCountEl = document.getElementById('pomo-count');
const pomoCircles = document.querySelectorAll('.pomo-circle');

pomoCountEl.textContent = pomoSessions;

function updatePomoDisplay() {
  minutesEl.textContent = String(pomoMinutes).padStart(2, '0');
  secondsEl.textContent = String(pomoSeconds).padStart(2, '0');
}

function startPomodoro() {
  if (isPomoActive) return;
  isPomoActive = true;
  pomoInterval = setInterval(() => {
    if (pomoSeconds === 0) {
      if (pomoMinutes === 0) {
        clearInterval(pomoInterval);
        isPomoActive = false;
        completePomoSession();
        return;
      } else {
        pomoMinutes--;
        pomoSeconds = 59;
      }
    } else {
      pomoSeconds--;
    }
    updatePomoDisplay();
  }, 1000);
}

function completePomoSession() {
  if (currentMode === 'work') {
    pomoSessions++;
    sessionCount++;
    localStorage.setItem('pomo-sessions', pomoSessions);
    pomoCountEl.textContent = pomoSessions;
    updatePomoCircles();
    
    if (sessionCount % 4 === 0) {
      setPomoMode('longBreak');
      showNotification('Great work! Time for a long break (15 min)');
    } else {
      setPomoMode('shortBreak');
      showNotification('Pomodoro completed! Take a short break (5 min)');
    }
  } else {
    setPomoMode('work');
    showNotification('Break over! Ready for another work session?');
  }
}

function setPomoMode(mode) {
  currentMode = mode;
  const modes = {
    work: { minutes: 25, label: 'Work Session' },
    shortBreak: { minutes: 5, label: 'Short Break' },
    longBreak: { minutes: 15, label: 'Long Break' }
  };
  
  pomoMinutes = modes[mode].minutes;
  pomoSeconds = 0;
  pomoModeEl.textContent = modes[mode].label;
  updatePomoDisplay();
}

function updatePomoCircles() {
  pomoCircles.forEach((circle, idx) => {
    circle.classList.toggle('completed', idx < (sessionCount % 4));
  });
}

function pausePomodoro() {
  clearInterval(pomoInterval);
  isPomoActive = false;
}

function resetPomodoro() {
  clearInterval(pomoInterval);
  isPomoActive = false;
  setPomoMode('work');
  sessionCount = 0;
  updatePomoCircles();
}

startBtn.onclick = startPomodoro;
pauseBtn.onclick = pausePomodoro;
resetBtn.onclick = resetPomodoro;

updatePomoDisplay();

// --- Weather Widget ---
async function updateWeather() {
  try {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo&units=metric');
    // Using demo data since API key is not available
    const mockWeather = {
      name: 'Your City',
      main: { temp: Math.floor(Math.random() * 30) + 10 },
      weather: [{ description: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)] }]
    };
    
    document.querySelector('.weather-location').textContent = `📍 ${mockWeather.name}`;
    document.querySelector('.weather-temp').textContent = `${mockWeather.main.temp}°C`;
    document.querySelector('.weather-desc').textContent = mockWeather.weather[0].description;
  } catch (error) {
    document.querySelector('.weather-desc').textContent = 'Weather unavailable';
  }
}

// --- Calendar ---
function buildCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const table = document.createElement('table');
  table.className = 'calendar-table';

  const thead = document.createElement('thead');
  const daysRow = document.createElement('tr');
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
    const th = document.createElement('th');
    th.textContent = day;
    daysRow.appendChild(th);
  });
  thead.appendChild(daysRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  let row = document.createElement('tr');
  let dayCount = 0;

  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement('td'));
    dayCount++;
  }

  for (let date = 1; date <= lastDate; date++) {
    const td = document.createElement('td');
    td.textContent = date;
    if (date === today.getDate()) td.className = 'today';
    row.appendChild(td);
    dayCount++;
    if (dayCount % 7 === 0) {
      tbody.appendChild(row);
      row = document.createElement('tr');
    }
  }
  
  while (dayCount % 7 !== 0) {
    row.appendChild(document.createElement('td'));
    dayCount++;
  }
  tbody.appendChild(row);
  table.appendChild(tbody);

  const header = document.createElement('div');
  header.style.marginBottom = "7px";
  header.style.fontWeight = "600";
  header.textContent = `${today.toLocaleString('default', { month: 'long' })} ${year}`;
  calendar.appendChild(header);
  calendar.appendChild(table);
}

// --- Analytics ---
function updateAnalytics() {
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = todos.filter(t => t.completedAt && t.completedAt.slice(0, 10) === today).length;
  const totalTasks = todos.length;
  const streak = calculateStreak();
  
  document.getElementById('total-tasks').textContent = totalTasks;
  document.getElementById('completed-today').textContent = completedToday;
  document.getElementById('streak-days').textContent = streak;
  document.getElementById('focus-time').textContent = `${Math.floor(totalFocusTime/60)}h`;
  
  drawProductivityChart();
}

function calculateStreak() {
  const dates = [...new Set(todos.filter(t => t.completedAt).map(t => t.completedAt.slice(0, 10)))].sort().reverse();
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i]);
    const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (daysDiff === streak) streak++;
    else break;
  }
  return streak;
}

function drawProductivityChart() {
  const canvas = document.getElementById('productivity-chart');
  const ctx = canvas.getContext('2d');
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const completed = todos.filter(t => t.completedAt && t.completedAt.slice(0, 10) === dateStr).length;
    last7Days.push({ date: dateStr, completed });
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxTasks = Math.max(...last7Days.map(d => d.completed), 1);
  const barWidth = canvas.width / 7;
  
  last7Days.forEach((day, idx) => {
    const barHeight = (day.completed / maxTasks) * (canvas.height - 20);
    const x = idx * barWidth + 10;
    const y = canvas.height - barHeight - 10;
    
    ctx.fillStyle = currentTheme === 'dark' ? '#60a5fa' : '#3b82f6';
    ctx.fillRect(x, y, barWidth - 20, barHeight);
    
    ctx.fillStyle = currentTheme === 'dark' ? '#a0a0a0' : '#555';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day.completed, x + (barWidth - 20) / 2, y - 5);
  });
}

// --- Data Export/Import ---
document.getElementById('export-data').onclick = () => {
  const data = { todos, habits, pomoSessions, focusSessions, totalFocusTime, theme: currentTheme };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `productivity-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  showNotification('Data exported successfully!');
};

document.getElementById('import-btn').onclick = () => {
  document.getElementById('import-data').click();
};

document.getElementById('import-data').onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.todos) { todos = data.todos; saveTodos(); renderTodos(); }
        if (data.habits) { habits = data.habits; localStorage.setItem('habits', JSON.stringify(habits)); renderHabits(); }
        if (data.pomoSessions) { pomoSessions = data.pomoSessions; localStorage.setItem('pomo-sessions', pomoSessions); }
        showNotification('Data imported successfully!');
      } catch (err) {
        showNotification('Invalid file format');
      }
    };
    reader.readAsText(file);
  }
};

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'k':
        e.preventDefault();
        todoInput.focus();
        break;
      case 'd':
        e.preventDefault();
        themeToggle.click();
        break;
      case ' ':
        e.preventDefault();
        if (isPomoActive) pausePomodoro();
        else startPomodoro();
        break;
      case 'f':
        e.preventDefault();
        document.getElementById('focus-toggle').click();
        break;
    }
  }
});

// --- Initialize ---
renderTodos();
renderHabits();
updatePomoCircles();
updateAnalytics();
updateWeather();
buildCalendar();

// Auto-update every minute
setInterval(() => {
  updateAnalytics();
  updateWeather();
}, 60000);

// Welcome notification
setTimeout(() => showNotification('Welcome to your enhanced Productivity Dashboard! 🚀'), 1000);