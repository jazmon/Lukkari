angular.module('lukkari.controllers')
  .controller('LunchCtrl', ['$scope', 'FoodService', 'ionicMaterialInk',
    'ionicMaterialMotion', '$ionicLoading',
    function($scope, FoodService, ionicMaterialInk, ionicMaterialMotion,
      $ionicLoading) {
      $ionicLoading.show({
        template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
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
