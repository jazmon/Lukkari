var lukkariControllers = angular.module('lukkari.controllers', ['ngCordova']);
const loadingTemplate = '<div class="loader"><svg class="circular">' +
'<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2"' +
' stroke-miterlimit="10"/></svg></div>';
// insert needed sidemenu stuff here
lukkariControllers.controller('LukkariCtrl', [
  function($scope) {}
]);

// controller for today view
lukkariControllers.controller('TodayCtrl', ['$scope', '$ionicLoading',
  'LocalStorage', '$ionicModal', 'MyDate', 'Lessons', 'ionicMaterialInk',
  'ionicMaterialMotion',
  function($scope, $ionicLoading, LocalStorage, $ionicModal, MyDate,
    Lessons, ionicMaterialInk, ionicMaterialMotion) {
    $scope.groupInfo = {};
    $scope.groupInfo.group = LocalStorage.get('groupName');
    $scope.currentDay = new Date();

    // Show new group modal when no group is set
    $ionicModal.fromTemplateUrl('templates/newgroup.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      if (!$scope.groupInfo.group) {
        // open modal to set group name
        $scope.modal.show();
      }
    });

    $scope.closeGroupName = function() {
      $scope.modal.hide();
    };

    function getAppointments() {
      $ionicLoading.show({
        template: loadingTemplate
      });

      Lessons.getDay({
        day: $scope.currentDay,
        callback: function(response) {
          $ionicLoading.hide();
          // Set Motion
          //ionicMaterialMotion.blinds();
          if (!response.success) {
            console.error('ERROR');
          } else {
            $scope.lessons = response.dayLessons;
          }
        }
      });
    }

    $scope.$on('ngLastRepeat.myList', function(e) {
      ionicMaterialMotion.blinds();
    });

    // sets the group
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

    // Moves a day forwards/backwards
    $scope.moveDay = function(direction) {
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

// controller for single appointment view
lukkariControllers.controller('LessonCtrl', ['$scope', '$ionicLoading',
  '$stateParams', 'Lessons','ionicMaterialInk', 'ionicMaterialMotion',
  function($scope, $ionicLoading, $stateParams, Lessons, ionicMaterialInk,
   ionicMaterialMotion) {
    $scope.lesson = Lessons.getLesson($stateParams.id);
  }
]);

// controller for weekly view
lukkariControllers.controller('WeekCtrl', ['$scope', '$ionicLoading',
  '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons','ionicMaterialInk',
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

lukkariControllers.controller('SettingsCtrl', ['$scope', 'LocalStorage',
  '$cordovaToast', '$ionicPlatform', '$timeout', '$cordovaCalendar',
  'Lessons', 'MyDate', 'ionicMaterialInk', 'ionicMaterialMotion',
  function($scope, LocalStorage, $cordovaToast, $ionicPlatform,
    $timeout, $cordovaCalendar, Lessons, MyDate, ionicMaterialInk,
     ionicMaterialMotion) {
    $scope.groupInfo = {};
    $scope.reminder = {};
    $scope.reminder.startDay = new Date();
    $scope.reminder.endDay = new Date();

    var toastOptions = {
      duration: 'long',
      position: 'center'
    };

    function datePickerCallback(val) {
      if (typeof(val) === 'undefined') {
        //console.log('No date selected');
      } else {
        //console.log('Selected date is : ', val);
        $scope.reminder.startDay = val;
        $scope.datepickerObject.inputDate = val;
      }
    }

    function datePickerCallback2(val) {
      if (typeof(val) === 'undefined') {
        //console.log('No date selected');
      } else {
        //console.log('Selected date is : ', val);
        $scope.reminder.endDay = val;
        $scope.datepickerObject2.inputDate = val;
      }
    }

    // https://github.com/rajeshwarpatlolla/ionic-datepicker
    $scope.datepickerObject = {
      titleLabel: 'Select Start Date', //Optional
      todayLabel: 'Today', //Optional
      closeLabel: '<span class="icon ion-android-close"></span>', //Optional
      setLabel: '<span class="icon ion-android-done"></span>', //Optional
      setButtonType: 'button-positive', //Optional
      todayButtonType: 'button-stable', //Optional
      closeButtonType: 'button-assertive', //Optional
      inputDate: $scope.reminder.startDay, //Optional
      mondayFirst: true, //Optional
      //disabledDates: disabledDates, //Optional
      //weekDaysList: weekDaysList, //Optional
      //monthList: monthList, //Optional
      templateType: 'popup', //Optional
      showTodayButton: 'true', //Optional
      modalHeaderColor: 'bar-stable', //Optional
      modalFooterColor: 'bar-stable', //Optional
      from: new Date(), //Optional
      //to: new Date(2018, 8, 25), //Optional
      callback: function(val) { //Mandatory
        datePickerCallback(val);
      },
      dateFormat: 'dd-MM-yyyy', //Optional
      closeOnSelect: true, //Optional
    };

    $scope.datepickerObject2 = {
      titleLabel: 'Select End Date', //Optional
      todayLabel: 'Today', //Optional
      closeLabel: '<span class="icon ion-android-close"></span>', //Optional
      setLabel: '<span class="icon ion-android-done"></span>', //Optional
      setButtonType: 'button-positive', //Optional
      todayButtonType: 'button-stable', //Optional
      closeButtonType: 'button-assertive', //Optional
      inputDate: $scope.reminder.endDay, //Optional
      mondayFirst: true, //Optional
      //disabledDates: disabledDates, //Optional
      //weekDaysList: weekDaysList, //Optional
      //monthList: monthList, //Optional
      templateType: 'popup', //Optional
      showTodayButton: false, //Optional
      modalHeaderColor: 'bar-positive', //Optional
      modalFooterColor: 'bar-positive', //Optional
      from: new Date(), //Optional
      //to: new Date(2018, 8, 25), //Optional
      callback: function(val) { //Mandatory
        datePickerCallback2(val);
      },
      dateFormat: 'dd-MM-yyyy', //Optional
      closeOnSelect: true, //Optional
    };

    $scope.reminder.time = 'null';
    $scope.groupInfo.group = LocalStorage.get('groupName');
    if (!$scope.groupInfo.group) {
      $scope.groupInfo.group = '';
    }

    $scope.changeGroup = function() {
      LocalStorage.set('groupName', $scope.groupInfo.group);
      // show toast that change was successful
      $ionicPlatform.ready(function() {
        try {
          $cordovaToast.show('Group successfully changed!',
            toastOptions.duration,
            toastOptions.position);
        } catch (e) {
          // do nothing because it fails on browser
        } finally {
          // change to today view after 2 seconds
          $timeout(function() {
            window.location.href = '#/app/today';
          }, 2000);
        }
      });
    };

    $scope.addToCalendar = function() {
      var appointments = [];
      var calOptions = {};
      // works on iOS only
      calOptions.calendarName = 'Lukkari app calendar';
      // android has id but no fucking idea what it does (1 is default)
      // so great documentation 5/5
      // https://github.com/EddyVerbruggen/Calendar-PhoneGap-Plugin
      calOptions.calendarId = 1;

      // google may set some default reminders depending on settings
      // https://github.com/EddyVerbruggen/Calendar-PhoneGap-Plugin/issues/201
      if ($scope.reminder.time !== 'null') {
        calOptions.firstReminderMinutes = $scope.reminder.time;
      } else {
        calOptions.firstReminderMinutes = null;
      }
      calOptions.secondReminderMinutes = null;

      var success = true;

      function createEvent(element, index, array) {
        var groups = '';
        for (var i = 0; i < element.groups.length; i++) {
          groups += element.groups[i] + ', ';
        }

        $cordovaCalendar.createEventWithOptions({
          title: element.name,
          location: element.room,
          notes: 'Teacher(s): ' + element.teacher +
            '\nGroup(s): ' + groups +
            '\nCourse: ' + element.code,
          startDate: element.startDay,
          endDate: element.endDay,
          firstReminderMinutes: calOptions.firstReminderMinutes,
          secondReminderMinutes: calOptions.secondReminderMinutes,
          calendarName: calOptions.calendarName,
          calendarId: calOptions.calendarId
            //calOptions: calOptions
        }).then(function(result) {
        }, function(err) {
          success = false;
        });
      }

      Lessons.getDayToDay({
        startDate: $scope.reminder.startDay,
        endDate: $scope.reminder.endDay,
        callback: function(response) {
          $ionicPlatform.ready(function() {
            response.lessons.forEach(createEvent);
          });
        }
      });
      var msg = '';
      if (success) {
        msg = 'Calendar events successfully added!';
      } else {
        msg = 'Failed to add calendar events!';
      }

      $cordovaToast.show(msg,
        toastOptions.duration,
        toastOptions.position);
      console.log(msg);
    };

    // Set Motion
    ionicMaterialMotion.ripple();

    // Set Ink
    ionicMaterialInk.displayEffect();
  }
]);

// TODO
lukkariControllers.controller('SearchCtrl', ['$scope', 'LocalStorage',
  function($scope, LocalStorage) {}
]);
