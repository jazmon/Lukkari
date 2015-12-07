angular.module('lukkari.controllers')
  // controller for single appointment view
  .controller('LessonCtrl', ['$scope','$stateParams', 'Lessons',
  'ionicMaterialInk',
    function($scope, $stateParams, Lessons, ionicMaterialInk) {
      $scope.lesson = Lessons.getLesson($stateParams.id);
      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
