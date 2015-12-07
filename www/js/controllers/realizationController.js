angular.module('lukkari.controllers')
  // controller for single appointment view
  .controller('RealizationCtrl', ['$scope',
    '$stateParams', 'Search', 'ionicMaterialInk',
    function($scope, $stateParams, Search, ionicMaterialInk) {
      const searchParams = {
        codes: [$stateParams.code],
        successCallback: (data) => {
          $scope.realization = data.realizations[0];
          $scope.realization.startDate = new Date($scope.realization.startDate);
          $scope.realization.endDate = new Date($scope.realization.endDate);
          $scope.realization.enrollmentStart =
            new Date($scope.realization.enrollmentStart);
          $scope.realization.enrollmentEnd =
            new Date($scope.realization.enrollmentEnd);

        },
        errorCallback: (status) => console.log(status)
      };
      $scope.realization = Search.search(searchParams);
      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
