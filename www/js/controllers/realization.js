'use strict';

function RealizationCtrl($stateParams, Search, ionicMaterialInk) {
    'ngInject';

    const vm = this;

    const searchParams = {
      codes: [$stateParams.code],
      successCallback: (data) => {
        vm.realization = data.realizations[0];
        vm.realization.startDate = new Date(vm.realization.startDate);
        vm.realization.endDate = new Date(vm.realization.endDate);
        vm.realization.enrollmentStart =
          new Date(vm.realization.enrollmentStart);
        vm.realization.enrollmentEnd =
          new Date(vm.realization.enrollmentEnd);

      },
      errorCallback: (status) => console.log(status)
    };
    vm.realization = Search.search(searchParams);
    // Set Ink
    ionicMaterialInk.displayEffect();
  }

export default {
    name: 'RealizationCtrl',
    fn: RealizationCtrl
  };
