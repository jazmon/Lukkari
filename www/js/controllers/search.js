'use strict';

function SearchCtrl($Search, $ionicLoading, $ionicModal,
  ionicMaterialInk, ionicMaterialMotion, $cordovaToast) {
  'ngInject';

  const vm = this;

  vm.searchParams = {
    successCallback: data => {
      if (data.realizations.length < 1000) {
        vm.realizations = data.realizations;
        vm.realizations.forEach((element) => {
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
    scope: vm
  }).then(modal => vm.modal = modal);

  vm.close = () => vm.modal.hide();

  vm.openSearch = () => vm.modal.show();

  vm.search = () => {
    vm.modal.hide();
    $ionicLoading.show({
      templateUrl: 'templates/loading.html'
    });
    if (vm.searchParams.code !== undefined &&
      vm.searchParams.code !== null) {
      vm.searchParams.codes = [vm.searchParams.code];
    }
    if (vm.searchParams.studentGroup !== undefined &&
      vm.searchParams.studentGroup !== null &&
      vm.searchParams.studentGroup !== '') {
      vm.searchParams.studentGroups = [vm.searchParams.studentGroup
        .toUpperCase()
      ];
    }
    Search.search(vm.searchParams);
  };

  vm.$on('ngLastRepeat.myList', e => ionicMaterialMotion.blinds());

  // Set Ink
  ionicMaterialInk.displayEffect();
}

export default {
  name: 'SearchCtrl',
  fn: SearchCtrl
};
