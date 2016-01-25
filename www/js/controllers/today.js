'use strict';

function TodayCtrl($ionicLoading, LocalStorage, $ionicModal, MyDate,
  Lessons, ionicMaterialInk, ionicMaterialMotion, Notifications) {
  'ngInject';

  const vm = this;

  vm.groupInfo = {
    group: LocalStorage.get({
      key: 'groupName'
    })
  };
  vm.currentDay = new Date();

  const useNotifications = LocalStorage.get({
    key: 'useNotification'
  });
  if (useNotifications == true) {
    Notifications.useNotifications({
      use: vm.notification.use,
      timeOffset: -vm.notification.time
    });
  }

  // Show new group modal when no group is set
  $ionicModal.fromTemplateUrl('templates/newgroup.html', {
    scope: vm
  }).then(modal => {
    vm.modal = modal;
    if (!vm.groupInfo.group) {
      // if (typeof AdMob !== 'undefined') {
      //   AdMob.hideBanner();
      // }
      // open modal to set group name
      vm.modal.show();
    }
  });

  vm.closeGroupName = () => {
    vm.modal.hide();
    if (typeof AdMob !== 'undefined') {
      AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
    }
  };

  function getAppointments() {
    $ionicLoading.show({
      templateUrl: 'templates/loading.html'
    });

    Lessons.getDay({
      day: vm.currentDay,
      callback: response => {
        $ionicLoading.hide();
        if (!response.success) {} else {
          vm.lessons = response.dayLessons;
        }
      }
    });
  }

  vm.$on('ngLastRepeat.myList', e => ionicMaterialMotion.blinds());

  // sets the group
  vm.setGroup = () => {
    LocalStorage.set({
      key: 'groupName',
      value: vm.groupInfo.group
    });
    vm.modal.hide();

    Lessons.changeGroup({
      groupName: vm.groupInfo.group,
      callback: success => success ? getAppointments() : console.error(
        'failed to change group name')
    });
  };

  vm.lessons = [];
  if (vm.groupInfo.group !== undefined &&
    vm.groupInfo.group !== null) {

    if (typeof AdMob !== 'undefined') {
      AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
    }
    Lessons.changeGroup({
      groupName: vm.groupInfo.group,
      callback: success => success ? getAppointments() : console.error(
        'failed to change group name')
    });
  }

  // Moves a day forwards/backwards
  vm.moveDay = (direction) => {

    // ad logic
    let lastAdTimeMillis = LocalStorage.get({
      key: 'adTime'
    });
    if (!lastAdTimeMillis) {
      if (typeof AdMob !== 'undefined') {
        AdMob.showInterstitial();
      }
      lastAdTimeMillis = Date.now();
      LocalStorage.set({
        key: 'adTime',
        value: lastAdTimeMillis
      });
    } else {
      const AD_DELAY = 300000;
      const difference = Date.now() - lastAdTimeMillis;
      if (difference > AD_DELAY) {
        if (typeof AdMob !== 'undefined') {
          AdMob.showInterstitial();
        }
        lastAdTimeMillis = Date.now();
        LocalStorage.set({
          key: 'adTime',
          value: lastAdTimeMillis
        });
      }
    }

    vm.currentDay = MyDate.getDayFromDay({
      currentDay: vm.currentDay,
      offsetDays: direction
    });

    getAppointments();
  };

  // Set Ink
  ionicMaterialInk.displayEffect();
}

export default {
  name: 'TodayCtrl',
  fn: TodayCtrl
};
