

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  TaskViewModel.subscribe(function (state) {
    TaskView.render(state);
  });

  TaskView.bindEvents();

  TaskView.render(TaskViewModel.getState());

  const isFirstVisit = !localStorage.getItem('taskflow_visited');
  if (isFirstVisit) {
    localStorage.setItem('taskflow_visited', '1');
    setTimeout(() => TaskView.showToast('Добро пожаловать в TaskFlow! 👋'), 500);
  }

});
