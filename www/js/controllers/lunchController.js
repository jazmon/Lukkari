angular.module('lukkari.controllers')
  .controller('LunchCtrl', ['$scope','FoodService', 'ionicMaterialInk',
  'ionicMaterialMotion',
    function($scope, FoodService, ionicMaterialInk, ionicMaterialMotion) {
      FoodService.get({
        callback: function(lunches) {
          $scope.lunches = lunches;
          console.log(lunches);
        }
      });

      $scope.$on('ngLastRepeat.myList', function(e) {
        ionicMaterialMotion.ripple();
      });

      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
