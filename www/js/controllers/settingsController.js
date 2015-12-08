angular.module('lukkari.controllers')
  .controller('SettingsCtrl', ['$scope', 'LocalStorage',
    '$cordovaToast', '$ionicPlatform', '$timeout', '$cordovaCalendar',
    'Lessons', 'MyDate', 'ionicMaterialInk', 'ionicMaterialMotion',
    '$cordovaLocalNotification', 'Notifications',
    function($scope, LocalStorage, $cordovaToast,
      $ionicPlatform, $timeout, $cordovaCalendar, Lessons, MyDate,
      ionicMaterialInk, ionicMaterialMotion, $cordovaLocalNotification,
      Notifications) {
      $scope.groupInfo = {
        group: LocalStorage.get({
          key: 'groupName'
        })
      };
      if (!$scope.groupInfo.group) {
        $scope.groupInfo.group = '';
      }
      $scope.reminder = {
        startDay: new Date(),
        endDay: new Date(),
        time: 'null'
      };
      $scope.notification = {
        use: LocalStorage.get({
          key: 'useNotification'
        }),
        time: null
      };
      if (!$scope.notification.use) {
        $scope.notification.use = false;
      }
      const toastOptions = {
        duration: 'long',
        position: 'center'
      };
      //console.log(i18n.t('lesson.course'));
      // https://github.com/rajeshwarpatlolla/ionic-datepicker
      $scope.datepickerObject = {
        titleLabel: i18n.t('settings.select_start_date'), //Optional
        todayLabel: i18n.t('settings.today'), //Optional
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
        callback: (val) => { //Mandatory
          if (typeof(val) === 'undefined') {
            console.log('No date selected');
          } else {
            $scope.reminder.startDay = val;
            $scope.datepickerObject.inputDate = val;
          }
        },
        dateFormat: 'dd-MM-yyyy', //Optional
        closeOnSelect: true, //Optional
      };
      $scope.datepickerObject2 = {
        titleLabel: i18n.t('settings.select_end_date'), //Optional
        todayLabel: i18n.t('settings.select_start_date'), //Optional
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
        callback: (val) => { //Mandatory
          if (typeof(val) === 'undefined') {
            //console.log('No date selected');
          } else {
            $scope.reminder.endDay = val;
            $scope.datepickerObject2.inputDate = val;
          }
        },
        dateFormat: 'dd-MM-yyyy', //Optional
        closeOnSelect: true, //Optional
      };

      $scope.changeGroup = () => {
        LocalStorage.set({
          key: 'groupName',
          value: $scope.groupInfo.group
        });
        // show toast that change was successful
        $ionicPlatform.ready(() => {
          $cordovaToast.show(i18n.t('settings.group_change_successful'),
            toastOptions.duration,
            toastOptions.position);
          // change to today view after 2 seconds
          $timeout(() => window.location.href = '#/app/today', 2000);
        });
      };

      $scope.setNotification = () => {
        Notifications.useNotifications({
          use: $scope.notification.use,
          timeOffset: -$scope.notification.time
        });
      };

      $scope.addToCalendar = () => {
        let appointments = [];
        let calOptions = {
          // works on iOS only
          calendarName: i18n.t('settings.calendar_name'),
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

          const notes = [i18n.t('settings.course_name'),
            element.code, '\n',
            i18n.t('settings.group'), groups
          ].join('');
          $cordovaCalendar.createEventWithOptions({
            title: element.name,
            location: element.room,
            notes,
            startDate: element.startDay,
            endDate: element.endDay,
            firstReminderMinutes: calOptions.firstReminderMinutes,
            secondReminderMinutes: calOptions.secondReminderMinutes,
            calendarName: calOptions.calendarName,
            calendarId: calOptions.calendarId
              //calOptions: calOptions
          }).then((result) => {}, (err) => {
            success = false;
          });
        }

        Lessons.getDayToDay({
          startDate: $scope.reminder.startDay,
          endDate: $scope.reminder.endDay,
          callback: (response) => {
            $ionicPlatform.ready(() => response.lessons.forEach(
              createEvent));
          }
        });
        let msg = '';
        if (success) {
          msg = i18n.t('settings.success_message');
        } else {
          msg = i18n.t('settings.failure_message');
        }

        $cordovaToast.show(msg,
          toastOptions.duration,
          toastOptions.position);
      };

      // Set Motion
      ionicMaterialMotion.ripple();

      // Set Ink
      ionicMaterialInk.displayEffect();
    }
  ]);
