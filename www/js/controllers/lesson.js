'use strict';

function LessonCtrl($stateParams, Lessons, ionicMaterialInk) {
  'ngInject';

  const vm = this;

  vm.lesson = Lessons.getLesson($stateParams.id);

  ionicMaterialInk.displayEffect();
}

export default {
  name: 'LessonCtrl',
  fn: LessonCtrl
};
