angular.module('lukkari.controllers')
  .controller('LunchCtrl', ['$scope', 'FoodService', 'ionicMaterialInk',
    'ionicMaterialMotion', '$ionicLoading',
    function($scope, FoodService, ionicMaterialInk, ionicMaterialMotion,
      $ionicLoading) {
      $ionicLoading.show({
        templateUrl: 'templates/loading.html'
      });
      FoodService.get({
        callback: (lunches) => {
          $scope.lunches = lunches;
          $ionicLoading.hide();
        }
      });

      $scope.$on('ngLastRepeat.myList', (e) => {
        ionicMaterialMotion.ripple();
      });

      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
