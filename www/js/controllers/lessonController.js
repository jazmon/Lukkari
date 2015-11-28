angular.module('lukkari.controllers')
  // controller for single appointment view
  .controller('LessonCtrl', ['$scope', '$ionicLoading',
    '$stateParams', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion',
    function($scope, $ionicLoading, $stateParams, Lessons, ionicMaterialInk,
      ionicMaterialMotion) {
      $scope.lesson = Lessons.getLesson($stateParams.id);
    }
  ]);
