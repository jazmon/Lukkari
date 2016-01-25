'use strict';

function WeekCtrl($ionicLoading, $ionicModal, LocalStorage, MyDate,
  Lessons, ionicMaterialInk, ionicMaterialMotion) {
  'ngInject';

  const vm = this;

  vm.groupInfo = {
    group: LocalStorage.get({
      key: 'groupName'
    })
  };
  vm.formatter = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric'
  });
  vm.currentDate = MyDate.getMonday(new Date());
  vm.endDate = MyDate.getDayFromDay({
    currentDay: vm.currentDate,
    offsetDays: 4
  });

  // Create modal for new group if no group name is set
  if (!vm.groupInfo.group) {
    $ionicModal.fromTemplateUrl('templates/newgroup.html', {
      scope: vm
    }).then(modal => {
      vm.modal = modal;
      // open modal to set group name
      vm.modal.show();
    });
  }

  vm.formatDate = (date) => {
    return vm.formatter.format(date);
  };

  // closes the group name dialog
  vm.closeGroupName = () => vm.modal.hide();

  // returns all of the appointments
  function getAppointments() {
    // show the loading window
    $ionicLoading.show({
      templateUrl: 'templates/loading.html'
    });
    // get all the appointments
    Lessons.getWeek({
      day: vm.currentDate,
      callback: response => {
        // hide the loading after done
        $ionicLoading.hide();
        if (!response.success) {
          console.error('ERROR');

          // hide the loading after done
          $ionicLoading.hide();
        } else {
          const allLessons = response.weekLessons;
          vm.days = [];
          for (let i = 0; i < 5; i++) {
            let day = {};
            // get mon-fri
            const date = MyDate.getDayFromDay({
              currentDay: vm.currentDate,
              offsetDays: i
            });
            day.date = vm.formatDate(date);
            day.lessons = [];
            const lessonsLength = allLessons.length;
            for (let j = 0; j < lessonsLength; j++) {
              const lesson = allLessons[j];
              // if same day push into the day array
              if (lesson.startDay.toDateString() ===
                date.toDateString()) {
                day.lessons.push(lesson);
              }
            }
            vm.days.push(day);
          }
        }
      }
    });
  }

  vm.$on('ngLastRepeat.myList', e => {

    // hide the loading after done
    $ionicLoading.hide();
    ionicMaterialMotion.ripple();
  });

  // sets the group name
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
  if (vm.groupInfo.group !== undefined) {
    Lessons.changeGroup({
      groupName: vm.groupInfo.group,
      callback: success => success ? getAppointments() : console.error(
        'failed to change group name')
    });
  }

  // moves a week forwards/backwards
  vm.moveWeek = (direction) => {
    vm.currentDate = MyDate.getDayFromDay({
      currentDay: vm.currentDate,
      offsetDays: (7 * direction)
    });
    vm.endDate = MyDate.getDayFromDay({
      currentDay: vm.currentDate,
      offsetDays: 4
    });

    getAppointments();
  };

  // Set Ink
  ionicMaterialInk.displayEffect();
}

export default {
  name: 'WeekCtrl',
  fn: WeekCtrl
};
