angular.module('lukkari.controllers')
  .controller('SettingsCtrl', ['$scope', 'LocalStorage',
    '$cordovaToast', '$ionicPlatform', '$timeout', '$cordovaCalendar',
    'Lessons', 'MyDate', 'ionicMaterialInk', 'ionicMaterialMotion',
    function($scope, LocalStorage, $cordovaToast, $ionicPlatform,
      $timeout, $cordovaCalendar, Lessons, MyDate, ionicMaterialInk,
      ionicMaterialMotion) {
      $scope.groupInfo = {};
      $scope.reminder = {};
      $scope.reminder.startDay = new Date();
      $scope.reminder.endDay = new Date();

      const toastOptions = {
        duration: 'long',
        position: 'center'
      };

      function datePickerCallback(val) {
        if (typeof(val) === 'undefined') {
          //console.log('No date selected');
        } else {
          $scope.reminder.startDay = val;
          $scope.datepickerObject.inputDate = val;
        }
      }

      function datePickerCallback2(val) {
        if (typeof(val) === 'undefined') {
          //console.log('No date selected');
        } else {
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
          $cordovaToast.show('Group successfully changed!',
            toastOptions.duration,
            toastOptions.position);
          // change to today view after 2 seconds
          $timeout(function() {
            window.location.href = '#/app/today';
          }, 2000);
        });
      };

      $scope.addToCalendar = function() {
        let appointments = [];
        let calOptions = {
          // works on iOS only
          calendarName: 'Lukkari app calendar',
          // android has id but no fucking idea what it does (1 is default)
          // so great documentation 5/5
          // https://github.com/EddyVerbruggen/Calendar-PhoneGap-Plugin
          calendarId: 1
        };

        // google may set some default reminders depending on settings
        // https://github.com/EddyVerbruggen/Calendar-PhoneGap-Plugin/issues/201
        if ($scope.reminder.time !== 'null') {
          calOptions.firstReminderMinutes = $scope.reminder.time;
        } else {
          calOptions.firstReminderMinutes = null;
        }
        calOptions.secondReminderMinutes = null;

        let success = true;

        function createEvent(element, index, array) {
          let groups = '';
          for (let i = 0; i < element.groups.length; i++) {
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
          }).then(function(result) {}, function(err) {
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
