
'use strict';

/**
 * @param {string} text 
 * @returns {Object} task
 */
function createTask(text) {
  return {
    id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text:      text.trim(),
    done:      false,
    createdAt: new Date().toISOString(),
  };
}


const TaskRepository = (function () {
  const STORAGE_KEY = 'taskflow_tasks_v1';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('TaskRepository: не удалось загрузить данные', e);
      return [];
    }
  }

  /** Сохранить задачи в хранилище */
  function save(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('TaskRepository: не удалось сохранить данные', e);
    }
  }

  function getAll() {
    return load();
  }

  /** Добавить задачу */
  function add(text) {
    const tasks = load();
    const task  = createTask(text);
    tasks.unshift(task);          // новые — сверху
    save(tasks);
    return task;
  }

  function remove(id) {
    const tasks   = load();
    const updated = tasks.filter(t => t.id !== id);
    save(updated);
    return updated;
  }

  /** Переключить статус выполнения */
  function toggleDone(id) {
    const tasks = load();
    const task  = tasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      save(tasks);
    }
    return tasks;
  }

  function clearDone() {
    const tasks   = load();
    const updated = tasks.filter(t => !t.done);
    save(updated);
    return updated;
  }

  return { getAll, add, remove, toggleDone, clearDone };
})();
