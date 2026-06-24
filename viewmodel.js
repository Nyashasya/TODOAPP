
'use strict';

const TaskViewModel = (function () {

  let _filter   = 'all';

  let _onChange = null;

  function subscribe(callback) {
    _onChange = callback;
  }

  function _notify() {
    if (typeof _onChange === 'function') {
      _onChange(getState());
    }
  }

  
  function getState() {
    const all     = TaskRepository.getAll();
    const active  = all.filter(t => !t.done);
    const done    = all.filter(t => t.done);
    const hasDone = done.length > 0;

    let visible;
    if (_filter === 'active')     visible = active;
    else if (_filter === 'done')  visible = done;
    else                          visible = all;

    return {
      tasks:        visible,       
      totalActive:  active.length, 
      hasDone,                    
      filter:       _filter,
    };
  }

  function setFilter(filter) {
    _filter = filter;
    _notify();
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return { ok: false, error: 'Введите текст задачи' };
    }
    if (trimmed.length > 200) {
      return { ok: false, error: 'Задача слишком длинная (макс. 200 символов)' };
    }
    TaskRepository.add(trimmed);
    _notify();
    return { ok: true };
  }

  function removeTask(id) {
    TaskRepository.remove(id);
    _notify();
  }

  function toggleTask(id) {
    TaskRepository.toggleDone(id);
    _notify();
  }

  function clearDone() {
    TaskRepository.clearDone();
    _notify();
  }

  return {
    subscribe,
    getState,
    setFilter,
    addTask,
    removeTask,
    toggleTask,
    clearDone,
  };
})();
