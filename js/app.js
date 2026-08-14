document.addEventListener('DOMContentLoaded', () => {
  initClockAndGreeting();
  initFocusTimer();
  initQuickLinks();
  initTodoList();
});

/* ==========================================================================
   1. Clock & Greeting (Challenge: Custom Name)
   ========================================================================== */
function initClockAndGreeting() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');
  const greetingTextEl = document.getElementById('greeting-text');
  const usernameEl = document.getElementById('username');

  // Load username from Local Storage
  const savedName = localStorage.getItem('dashboard_username');
  if (savedName) {
    usernameEl.textContent = savedName;
  }

  // Save editable username on blur or Enter key
  usernameEl.addEventListener('blur', () => {
    let name = usernameEl.textContent.trim();
    if (!name) name = 'Friend';
    usernameEl.textContent = name;
    localStorage.setItem('dashboard_username', name);
  });

  usernameEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      usernameEl.blur();
    }
  });

  function update() {
    const now = new Date();

    clockEl.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const hour = now.getHours();
    let greetingText = 'Good morning';
    if (hour >= 12 && hour < 17) {
      greetingText = 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      greetingText = 'Good evening';
    } else if (hour >= 22 || hour < 5) {
      greetingText = 'Good night';
    }
    greetingTextEl.textContent = greetingText;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. Focus Timer (Challenge: Change Pomodoro Time)
   ========================================================================== */
function initFocusTimer() {
  let selectedMinutes = 25;
  let timeRemaining = selectedMinutes * 60;
  let timerInterval = null;

  const displayEl = document.getElementById('timer-display');
  const startBtn = document.getElementById('timer-start-btn');
  const stopBtn = document.getElementById('timer-stop-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  const presetBtns = document.querySelectorAll('.btn-preset');

  function render() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    displayEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function setPresetTime(minutes) {
    stopTimer();
    selectedMinutes = minutes;
    timeRemaining = minutes * 60;
    render();
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setPresetTime(parseInt(btn.dataset.time, 10));
    });
  });

  function startTimer() {
    if (timerInterval) return;

    startBtn.disabled = true;
    stopBtn.disabled = false;

    timerInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        render();
      } else {
        stopTimer();
        alert('Focus session complete!');
        resetTimer();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  function resetTimer() {
    stopTimer();
    timeRemaining = selectedMinutes * 60;
    render();
  }

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);

  render();
}

/* ==========================================================================
   3. Quick Links
   ========================================================================== */
function initQuickLinks() {
  const STORAGE_KEY = 'dashboard_quick_links';
  const form = document.getElementById('link-form');
  const titleInput = document.getElementById('link-title');
  const urlInput = document.getElementById('link-url');
  const listEl = document.getElementById('links-list');

  const defaultLinks = [
    { id: '1', title: 'Google', url: 'https://google.com' },
    { id: '2', title: 'GitHub', url: 'https://github.com' }
  ];

  let links = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultLinks;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  function render() {
    listEl.innerHTML = '';
    links.forEach((link) => {
      const li = document.createElement('li');
      li.className = 'link-item';

      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link.title;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger btn-icon';
      deleteBtn.textContent = '✕';
      deleteBtn.onclick = () => deleteLink(link.id);

      li.appendChild(anchor);
      li.appendChild(deleteBtn);
      listEl.appendChild(li);
    });
  }

  function addLink(e) {
    e.preventDefault();
    let url = urlInput.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    links.push({
      id: Date.now().toString(),
      title: titleInput.value.trim(),
      url: url
    });

    save();
    render();

    titleInput.value = '';
    urlInput.value = '';
  }

  function deleteLink(id) {
    links = links.filter((link) => link.id !== id);
    save();
    render();
  }

  form.addEventListener('submit', addLink);
  render();
}

/* ==========================================================================
   4. To-Do List (Challenge: Prevent Duplicate Tasks)
   ========================================================================== */
function initTodoList() {
  const STORAGE_KEY = 'dashboard_todos';
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const listEl = document.getElementById('todo-list');

  let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { id: '1', text: 'Plan tomorrow’s goals', completed: false }
  ];

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function render() {
    listEl.innerHTML = '';
    todos.forEach((todo) => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

      const leftDiv = document.createElement('div');
      leftDiv.className = 'todo-item-left';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.onchange = () => toggleTodo(todo.id);

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(span);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-icon';
      editBtn.textContent = '✎';
      editBtn.onclick = () => editTodo(todo.id);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-icon btn-danger';
      deleteBtn.textContent = '✕';
      deleteBtn.onclick = () => deleteTodo(todo.id);

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(leftDiv);
      li.appendChild(actionsDiv);
      listEl.appendChild(li);
    });
  }

  function addTodo(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Challenge implementation: Duplicate task validation
    const isDuplicate = todos.some(
      (todo) => todo.text.toLowerCase() === text.toLowerCase()
    );

    if (isDuplicate) {
      alert('This task already exists in your list!');
      return;
    }

    todos.push({
      id: Date.now().toString(),
      text,
      completed: false
    });

    save();
    render();
    input.value = '';
  }

  function toggleTodo(id) {
    todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    save();
    render();
  }

  function editTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newText = prompt('Edit task:', todo.text);
    if (newText !== null && newText.trim() !== '') {
      const trimmed = newText.trim();
      
      // Prevent duplicate edit names
      const isDuplicate = todos.some(
        (t) => t.id !== id && t.text.toLowerCase() === trimmed.toLowerCase()
      );

      if (isDuplicate) {
        alert('Another task already has this exact name.');
        return;
      }

      todo.text = trimmed;
      save();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  form.addEventListener('submit', addTodo);
  render();
}