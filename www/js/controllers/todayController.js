angular.module('lukkari.controllers')
  // controller for today view
  .controller('TodayCtrl', ['$scope', '$ionicLoading',
    'LocalStorage', '$ionicModal', 'MyDate', 'Lessons', 'ionicMaterialInk',
    'ionicMaterialMotion', 'Notifications',
    function($scope, $ionicLoading, LocalStorage, $ionicModal, MyDate,
      Lessons, ionicMaterialInk, ionicMaterialMotion, Notifications) {
      $scope.groupInfo = {
        group: LocalStorage.get({
          key: 'groupName'
        })
      };
      $scope.currentDay = new Date();

      const useNotifications = LocalStorage.get({
        key: 'useNotification'
      });
      console.log(useNotifications);
      if (useNotifications !== null && useNotifications == true) {
        console.log('setting notifications');
        Notifications.useNotifications({
          use: $scope.notification.use,
          timeOffset: -$scope.notification.time
        });
      }

      // Show new group modal when no group is set
      $ionicModal.fromTemplateUrl('templates/newgroup.html', {
        scope: $scope
      }).then(modal => {
        $scope.modal = modal;
        if (!$scope.groupInfo.group) {
          // open modal to set group name
          $scope.modal.show();
        }
      });

      $scope.closeGroupName = () => $scope.modal.hide();

      function getAppointments() {
        $ionicLoading.show({
          templateUrl: 'templates/loading.html'
        });

        Lessons.getDay({
          day: $scope.currentDay,
          callback: response => {
            $ionicLoading.hide();
            if (!response.success) {
              console.error('ERROR');
            } else {
              $scope.lessons = response.dayLessons;
            }
          }
        });
      }

      $scope.$on('ngLastRepeat.myList', e => ionicMaterialMotion.blinds());

      // sets the group
      $scope.setGroup = () => {
        LocalStorage.set({
          key: 'groupName',
          value: $scope.groupInfo.group
        });
        $scope.modal.hide();

        Lessons.changeGroup({
          groupName: $scope.groupInfo.group,
          callback: success => success ? getAppointments() : console.error(
            'failed to change group name')
        });
      };

      $scope.lessons = [];
      if ($scope.groupInfo.group !== undefined &&
        $scope.groupInfo.group !== null) {
        Lessons.changeGroup({
          groupName: $scope.groupInfo.group,
          callback: success => success ? getAppointments() : console.error(
            'failed to change group name')
        });
      }

      // Moves a day forwards/backwards
      $scope.moveDay = (direction) => {
        $scope.currentDay = MyDate.getDayFromDay({
          currentDay: $scope.currentDay,
          offsetDays: direction
        });

        getAppointments();
      };

      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
