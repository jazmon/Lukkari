angular.module('lukkari.controllers')
  // controller for weekly view
  .controller('WeekCtrl', ['$scope', '$ionicLoading',
    '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons', 'ionicMaterialInk',
    'ionicMaterialMotion',
    function($scope, $ionicLoading, $ionicModal, LocalStorage, MyDate,
      Lessons, ionicMaterialInk, ionicMaterialMotion) {
      $scope.groupInfo = {};
      $scope.groupInfo.group = LocalStorage.get('groupName');
      $scope.currentDate = MyDate.getMonday(new Date());
      $scope.endDate = MyDate.getDayFromDay({
        currentDay: $scope.currentDate,
        offsetDays: 4
      });

      // Create modal for new group if no group name is set
      if (!$scope.groupInfo.group) {
        $ionicModal.fromTemplateUrl('templates/newgroup.html', {
          scope: $scope
        }).then(function(modal) {
          $scope.modal = modal;
          // open modal to set group name
          $scope.modal.show();
        });
      }

      // closes the group name dialog
      $scope.closeGroupName = function() {
        $scope.modal.hide();
      };

      // returns all of the appointments
      function getAppointments() {
        // show the loading window
        $ionicLoading.show({
          template: loadingTemplate
        });
        // get all the appointments
        Lessons.getWeek({
          day: $scope.currentDate,
          callback: function(response) {
            $ionicLoading.hide();
            //ionicMaterialMotion.ripple();

            if (!response.success) {
              console.error('ERROR');
            } else {
              var allLessons = response.weekLessons;
              $scope.days = [];
              for (var i = 0; i < 5; i++) {
                var day = {};
                // get mon-fri
                day.date = MyDate.getDayFromDay({
                  currentDay: $scope.currentDate,
                  offsetDays: i
                });
                day.lessons = [];
                var lessonsLength = allLessons.length;
                for (var j = 0; j < lessonsLength; j++) {
                  var lesson = allLessons[j];
                  // if same day push into the day array
                  if (lesson.startDay.toDateString() ===
                    day.date.toDateString()) {
                    day.lessons.push(lesson);
                  }
                }
                $scope.days.push(day);
              }
            }
          }
        });
        // hide the loading after done
        $ionicLoading.hide();
      }

      $scope.$on('ngLastRepeat.myList', function(e) {
        ionicMaterialMotion.blinds();
      });

      // sets the group name
      $scope.setGroup = function() {
        LocalStorage.set('groupName', $scope.groupInfo.group);
        $scope.modal.hide();

        Lessons.changeGroup({
          groupName: $scope.groupInfo.group,
          callback: function(success) {
            if (success) {
              getAppointments();
            } else {
              console.error('failed to change group name');
            }
          }
        });
      };

      $scope.lessons = [];
      if ($scope.groupInfo.group !== undefined) {
        Lessons.changeGroup({
          groupName: $scope.groupInfo.group,
          callback: function(success) {
            if (success) {
              getAppointments();
            } else {
              console.error('failed to change group name');
            }
          }
        });
      }

      // moves a week forwards/backwards
      $scope.moveWeek = function(direction) {
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
