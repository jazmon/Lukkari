angular.module('lukkari.controllers')
  // controller for single appointment view
  .controller('LessonCtrl', ['$scope', '$ionicLoading',
    '$stateParams', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion',
    function($scope, $ionicLoading, $stateParams, Lessons, ionicMaterialInk) {
      $scope.lesson = Lessons.getLesson($stateParams.id);
      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
