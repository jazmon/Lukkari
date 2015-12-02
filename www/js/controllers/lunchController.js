angular.module('lukkari.controllers')
  .controller('LunchCtrl', ['$scope', 'FoodService', 'ionicMaterialInk',
    'ionicMaterialMotion', '$ionicLoading',
    function($scope, FoodService, ionicMaterialInk, ionicMaterialMotion,
      $ionicLoading) {
      $ionicLoading.show({
        templateUrl: 'templates/loading.html'
      });
      FoodService.get({
        callback: function(lunches) {
          $scope.lunches = lunches;
          $ionicLoading.hide();
        }
      });

      $scope.$on('ngLastRepeat.myList', function(e) {
        ionicMaterialMotion.ripple();
      });

      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
