angular.module('lukkari.controllers')
  .controller('SearchCtrl', ['$scope', 'Search', '$ionicLoading',
    '$ionicModal', 'ionicMaterialInk', 'ionicMaterialMotion', '$cordovaToast',
    function($scope, Search, $ionicLoading, $ionicModal,
      ionicMaterialInk, ionicMaterialMotion, $cordovaToast) {
      $scope.searchParams = {
        successCallback: data => {
          if (data.realizations.length < 1000) {
            $scope.realizations = data.realizations;
            $scope.realizations.forEach((element) => {
              element.startDate = new Date(element.startDate);
              element.endDate = new Date(element.endDate);
            });
          } else {
            $cordovaToast.show(i18n.t('search.please_enter_parameters'),
              'long',
              'center');
          }
          $ionicLoading.hide();
        },
        errorCallback: status => console.error(status)
      };

      $ionicModal.fromTemplateUrl('templates/searchModal.html', {
        scope: $scope
      }).then(modal => $scope.modal = modal);

      $scope.close = () => $scope.modal.hide();

      $scope.openSearch = () => $scope.modal.show();

      $scope.search = () => {
        $scope.modal.hide();
        $ionicLoading.show({
          templateUrl: 'templates/loading.html'
        });
        if ($scope.searchParams.code !== undefined &&
          $scope.searchParams.code !== null) {
          $scope.searchParams.codes = [$scope.searchParams.code];
        }
        if ($scope.searchParams.studentGroup !== undefined &&
          $scope.searchParams.studentGroup !== null &&
          $scope.searchParams.studentGroup !== '') {
          $scope.searchParams.studentGroups = [$scope.searchParams.studentGroup
            .toUpperCase()
          ];
        }
        Search.search($scope.searchParams);
      };

      $scope.$on('ngLastRepeat.myList', e => ionicMaterialMotion.blinds());

      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
