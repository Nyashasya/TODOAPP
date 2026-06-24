
'use strict';

const TaskView = (function () {

  const taskListEl   = document.getElementById('taskList');
  const taskInputEl  = document.getElementById('taskInput');
  const addBtnEl     = document.getElementById('addBtn');
  const inputErrorEl = document.getElementById('inputError');
  const emptyStateEl = document.getElementById('emptyState');
  const statsLabelEl = document.getElementById('statsLabel');
  const clearDoneEl  = document.getElementById('clearDoneBtn');
  const tabEls       = document.querySelectorAll('.tab');
  const toastEl      = document.getElementById('toast');

  let _toastTimer = null;

  function _formatDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const isToday =
      d.getDate()    === now.getDate()    &&
      d.getMonth()   === now.getMonth()   &&
      d.getFullYear()=== now.getFullYear();

    if (isToday) {
      return 'сегодня ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  function _createTaskEl(task) {
    const li = document.createElement('li');
    li.className  = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;
    li.setAttribute('role', 'listitem');

    li.innerHTML = `
      <div class="task-check"
           role="checkbox"
           aria-checked="${task.done}"
           aria-label="${task.done ? 'Снять отметку' : 'Отметить выполненной'}"
           tabindex="0">
      </div>
      <div class="task-body">
        <span class="task-text">${_escapeHtml(task.text)}</span>
        <span class="task-date">${_formatDate(task.createdAt)}</span>
      </div>
      <button class="delete-btn"
              aria-label="Удалить задачу"
              title="Удалить">✕</button>
    `;

    li.querySelector('.task-check').addEventListener('click', () => {
      TaskViewModel.toggleTask(task.id);
    });

    li.querySelector('.task-check').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        TaskViewModel.toggleTask(task.id);
      }
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      li.classList.add('removing');
      li.addEventListener('animationend', () => {
        TaskViewModel.removeTask(task.id);
        showToast('Задача удалена');
      }, { once: true });
    });

    return li;
  }

  function _escapeHtml(str) {
    return str
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  function render(state) {
    taskListEl.innerHTML = '';
    if (state.tasks.length === 0) {
      emptyStateEl.classList.remove('hidden');
    } else {
      emptyStateEl.classList.add('hidden');
      const frag = document.createDocumentFragment();
      state.tasks.forEach(t => frag.appendChild(_createTaskEl(t)));
      taskListEl.appendChild(frag);
    }

    const n = state.totalActive;
    statsLabelEl.textContent =
      n === 0 ? 'Нет активных'
      : n === 1 ? '1 активная'
      : n < 5  ? `${n} активные`
      : `${n} активных`;

    clearDoneEl.classList.toggle('hidden', !state.hasDone);

    tabEls.forEach(tab => {
      const isActive = tab.dataset.filter === state.filter;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
  }

  function showToast(message) {
    clearTimeout(_toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('show');
    _toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function showError(msg) {
    inputErrorEl.textContent = msg;
    taskInputEl.classList.add('input-err');
    setTimeout(() => {
      inputErrorEl.textContent = '';
      taskInputEl.classList.remove('input-err');
    }, 3000);
  }

  function bindEvents() {
    // Кнопка «Добавить»
    addBtnEl.addEventListener('click', _handleAdd);

    taskInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') _handleAdd();
    });

    tabEls.forEach(tab => {
      tab.addEventListener('click', () => {
        TaskViewModel.setFilter(tab.dataset.filter);
      });
    });

    clearDoneEl.addEventListener('click', () => {
      TaskViewModel.clearDone();
      showToast('Выполненные задачи удалены');
    });
  }

  function _handleAdd() {
    const text   = taskInputEl.value;
    const result = TaskViewModel.addTask(text);
    if (result.ok) {
      taskInputEl.value = '';
      taskInputEl.focus();
      showToast('Задача добавлена ✓');
    } else {
      showError(result.error);
      taskInputEl.focus();
    }
  }

  return { render, bindEvents, showToast };
})();
