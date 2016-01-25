'use strict';

function LunchCtrl(FoodService, ionicMaterialInk, ionicMaterialMotion,
   $ionicLoading) {
  'ngInject';

  const vm = this;
  $ionicLoading.show({
    templateUrl: 'templates/loading.html'
  });
  FoodService.get({
    callback: (lunches) => {
      vm.lunches = lunches;
      $ionicLoading.hide();
    }
  });

  vm.$on('ngLastRepeat.myList', (e) => {
    ionicMaterialMotion.ripple();
  });

  // Set Ink
  ionicMaterialInk.displayEffect();

}

export default {
  name: 'LunchCtrl',
  fn: LunchCtrl
};
