angular.module('lukkari.controllers')
  // controller for weekly view
  .controller('WeekCtrl', ['$scope', '$ionicLoading',
    '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons', 'ionicMaterialInk',
    'ionicMaterialMotion',
    function($scope, $ionicLoading, $ionicModal, LocalStorage, MyDate,
      Lessons, ionicMaterialInk, ionicMaterialMotion) {
      $scope.groupInfo = {
        group: LocalStorage.get({
          key: 'groupName'
        })
      };
      $scope.formatter = new Intl.DateTimeFormat(navigator.language, {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric'
      });
      $scope.currentDate = MyDate.getMonday(new Date());
      $scope.endDate = MyDate.getDayFromDay({
        currentDay: $scope.currentDate,
        offsetDays: 4
      });

      // Create modal for new group if no group name is set
      if (!$scope.groupInfo.group) {
        $ionicModal.fromTemplateUrl('templates/newgroup.html', {
          scope: $scope
        }).then(modal => {
          $scope.modal = modal;
          // open modal to set group name
          $scope.modal.show();
        });
      }

      $scope.formatDate = (date) => {
        return $scope.formatter.format(date);
      };

      // closes the group name dialog
      $scope.closeGroupName = () => $scope.modal.hide();

      // returns all of the appointments
      function getAppointments() {
        // show the loading window
        $ionicLoading.show({
          templateUrl: 'templates/loading.html'
        });
        // get all the appointments
        Lessons.getWeek({
          day: $scope.currentDate,
          callback: response => {
            // hide the loading after done
            $ionicLoading.hide();
            if (!response.success) {
              console.error('ERROR');

              // hide the loading after done
              $ionicLoading.hide();
            } else {
              const allLessons = response.weekLessons;
              $scope.days = [];
              for (let i = 0; i < 5; i++) {
                let day = {};
                // get mon-fri
                const date = MyDate.getDayFromDay({
                  currentDay: $scope.currentDate,
                  offsetDays: i
                });
                day.date = $scope.formatDate(date);
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
                $scope.days.push(day);
              }
            }
          }
        });
      }

      $scope.$on('ngLastRepeat.myList', e => {

        // hide the loading after done
        $ionicLoading.hide();
        ionicMaterialMotion.ripple();
      });

      // sets the group name
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
      if ($scope.groupInfo.group !== undefined) {
        Lessons.changeGroup({
          groupName: $scope.groupInfo.group,
          callback: success => success ? getAppointments() : console.error(
            'failed to change group name')
        });
      }

      // moves a week forwards/backwards
      $scope.moveWeek = (direction) => {
        $scope.currentDate = MyDate.getDayFromDay({
          currentDay: $scope.currentDate,
          offsetDays: (7 * direction)
        });
        $scope.endDate = MyDate.getDayFromDay({
          currentDay: $scope.currentDate,
          offsetDays: 4
        });

        getAppointments();
      };

      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
