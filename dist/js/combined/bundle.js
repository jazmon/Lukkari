'use strict';

var lukkariApp = angular.module('lukkari', ['ionic', 'lukkari.controllers', 'lukkari.services', 'lukkari.directives', 'ionic-datepicker']);

lukkariApp.run(['$ionicPlatform', function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
}]);

// http://blog.ionic.io/handling-cors-issues-in-ionic/
lukkariApp.constant('ApiEndpoint', {
  url: 'http://localhost:8100/api'
});

// menuContent-view is presented on the main view.
lukkariApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'LukkariCtrl'
  }).state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      }
    }
  }).state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  }).state('app.todayAppointment', {
    url: '/today/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/appointment.html',
        controller: 'AppointmentCtrl'
      }
    }
  }).state('app.today', {
    url: '/today',
    views: {
      'menuContent': {
        templateUrl: 'templates/today.html',
        controller: 'TodayCtrl'
      }
    }
  }).state('app.appointment', {
    url: '/week/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/appointment.html',
        controller: 'AppointmentCtrl'
      }
    }
  }).state('app.week', {
    url: '/week',
    views: {
      'menuContent': {
        templateUrl: 'templates/week.html',
        controller: 'WeekCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/today');
}]);
'use strict';

var lukkariControllers = angular.module('lukkari.controllers', ['ngCordova']);

// insert needed sidemenu stuff here
lukkariControllers.controller('LukkariCtrl', [function ($scope) {}]);

// controller for today view
lukkariControllers.controller('TodayCtrl', ['$scope', '$ionicLoading', 'LocalStorage', '$ionicModal', 'MyDate', 'Lessons', function ($scope, $ionicLoading, LocalStorage, $ionicModal, MyDate, Lessons) {
  $scope.groupInfo = {};
  $scope.groupInfo.group = LocalStorage.get('groupName');
  $scope.dayOffset = 0;
  $scope.currentDay = new Date();

  // Show new group modal when no group is set
  $ionicModal.fromTemplateUrl('templates/newgroup.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
    if (!$scope.groupInfo.group) {
      // open modal to set group name
      $scope.modal.show();
    }
  });

  $scope.closeGroupName = function () {
    $scope.modal.hide();
  };

  // sets the group
  $scope.setGroup = function () {
    LocalStorage.set('groupName', $scope.groupInfo.group);
    $scope.modal.hide();
    $ionicLoading.show({
      template: 'Loading...'
    });

    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        if (success) {
          console.log('successfully changed group name');
          Lessons.getDay({
            day: $scope.currentDay,
            callback: function callback(response) {
              if (!response.success) {
                console.log('ERROR');
              } else {
                $scope.lessons = response.dayLessons;
              }
            }
          });
        } else {
          console.log('failed to change group name');
        }
      }
    });
  };

  $scope.lessons = [];
  if ($scope.groupInfo.group !== undefined) {
    $ionicLoading.show({
      template: 'Loading...'
    });
    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        if (success) {
          console.log('successfully changed group name');

          Lessons.getDay({
            day: $scope.currentDay,
            callback: function callback(response) {
              $ionicLoading.hide();
              if (!response.success) {
                console.log('ERROR');
              } else {
                $scope.lessons = response.dayLessons;
              }
            }
          });
        } else {
          console.log('failed to change group name');
        }
      }
    });
  }

  // Moves a day forwards/backwards
  $scope.moveDay = function (direction) {
    $ionicLoading.show({
      template: 'Loading...'
    });

    $scope.currentDay = MyDate.getDayFromDay({
      currentDay: $scope.currentDay,
      offsetDays: direction
    });

    Lessons.getDay({
      day: $scope.currentDay,
      callback: function callback(response) {
        $ionicLoading.hide();
        if (!response.success) {
          console.log('ERROR');
        } else {
          $scope.lessons = response.dayLessons;
        }
      }
    });
  };
}]);

// controller for single appointment view
lukkariControllers.controller('AppointmentCtrl', ['$scope', '$ionicLoading', '$stateParams', function ($scope, $ionicLoading, $stateParams) {
  //$scope.appointment = Timetables.getAppointment($stateParams.id);
}]);

// controller for weekly view
lukkariControllers.controller('WeekCtrl', ['$scope', '$ionicLoading', '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons', function ($scope, $ionicLoading, $ionicModal, LocalStorage, MyDate, Lessons) {
  $scope.groupInfo = {};
  $scope.week = {};
  $scope.weekOffset = 0;
  $scope.groupInfo.group = LocalStorage.get('groupName');

  // Create modal for new group if no group name is set
  if (!$scope.groupInfo.group) {
    $ionicModal.fromTemplateUrl('templates/newgroup.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;

      // open modal to set group name
      $scope.modal.show();
    });
  }

  // closes the group name dialog
  $scope.closeGroupName = function () {
    $scope.modal.hide();
  };

  // returns all of the appointments
  function getAppointments() {
    // show the loading window
    /*$ionicLoading.show({
      template: 'Loading...'
    });*/
    // get all the appointments
    /*Timetables.getWeek($scope.groupInfo.group, $scope.weekOffset,
      function(result) {
        var appointments = result;
        $scope.days = [];
        var startDate = MyDate.getMonday(appointments[0].startDate);
        // loop whole week
        for (var i = 0; i < 5; i++) {
          var day = {};
          // get mon-sun day
          day.date = MyDate.getDayFromDay(startDate, i);
          day.appointments = [];
          for (var j = 0; j < appointments.length; j++) {
            var appointment = appointments[j];
            // if is the same day push into the array
            if (appointment.startDate.toDateString() ===
              day.date.toDateString()) {
              day.appointments.push(appointment);
            }
          }
          // add the day into the array
          $scope.days.push(day);
        }
        // hide the loading after done
        $ionicLoading.hide();
      });*/
  }

  Lessons.get($scope.groupInfo.group, function (lessons) {
    if (lessons.hasOwnProperty('success') && lessons.success !== false) {
      console.log('FAILED');
    } else {

      $scope.lessons = lessons;
    }
  });

  // sets the group name
  $scope.setGroup = function () {
    LocalStorage.set('groupName', $scope.groupInfo.group);
    $scope.modal.hide();
    getAppointments();
  };

  $scope.appointments = [];
  if ($scope.groupInfo.group !== undefined) {
    getAppointments();
  }

  // moves a week forwards/backwards
  $scope.moveWeek = function (direction) {
    $scope.weekOffset += direction;
    getAppointments();
  };
}]);

lukkariControllers.controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform', '$cookies', '$timeout', '$cordovaCalendar', function ($scope, LocalStorage, $cordovaToast, $ionicPlatform, $cookies, $timeout, $cordovaCalendar) {
  $scope.groupInfo = {};
  $scope.reminder = {};
  $scope.reminder.startDay = new Date();
  $scope.reminder.weeks = 1;

  var toastOptions = {
    duration: 'long',
    position: 'center'
  };

  function datePickerCallback(val) {
    // do something
    if (typeof val === 'undefined') {
      console.log('No date selected');
    } else {
      console.log('Selected date is : ', val);
      $scope.reminder.startDay = val;
    }
  }

  // https://github.com/rajeshwarpatlolla/ionic-datepicker
  $scope.datepickerObject = {
    titleLabel: 'Select Date', //Optional
    todayLabel: 'Today', //Optional
    closeLabel: 'Close', //Optional
    setLabel: 'Set', //Optional
    setButtonType: 'button-positive', //Optional
    todayButtonType: 'button-stable', //Optional
    closeButtonType: 'button-stable', //Optional
    inputDate: new Date(), //Optional
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
    callback: function callback(val) {
      //Mandatory
      datePickerCallback(val);
    },
    dateFormat: 'dd-MM-yyyy', //Optional
    closeOnSelect: false };

  //Optional
  $scope.reminder.time = 'null';
  $scope.groupInfo.group = LocalStorage.get('groupName');
  if (!$scope.groupInfo.group) {
    $scope.groupInfo.group = '';
  }

  $scope.changeGroup = function () {
    LocalStorage.set('groupName', $scope.groupInfo.group);
    // show toast that change was successful
    $ionicPlatform.ready(function () {
      try {
        $cordovaToast.show('Group successfully changed!', toastOptions.duration, toastOptions.position).then(function (success) {
          $cookies.remove('PHPSESSID');
        });
      } catch (e) {
        // do nothing
      } finally {
        // change to today view after 2 seconds
        $timeout(function () {
          window.location.href = '#/app/today';
        }, 2000);
      }
    });
  };

  $scope.addToCalendar = function () {
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
    console.log('$scope.reminder.weeks: ' + $scope.reminder.weeks);
    console.log('$scope.reminder.startDay: ' + $scope.reminder.startDay);
    // TODO create a service method that can get days from a day to a day.
    // and use it here.

    function getAppointments(result) {
      appointments = result;
      $ionicPlatform.ready(function () {
        appointments.forEach(createEvent(elment, index, array));
      });
    }

    function createEvent(element, index, array) {
      /*$cordovaCalendar.createEventWithOptions({
                      title: element.summary,
                      location: element.location,
                      notes: 'Teacher(s): ' + element.teacher +
                          '\nGroup(s): ' + element.groups +
                          '\nCourse: ' + element.courseNumber,
                      startDate: element.startDate,
                      endDate: element.endDate,
                      firstReminderMinutes: calOptions.firstReminderMinutes,
                      secondReminderMinutes: calOptions.secondReminderMinutes,
                      calendarName: calOptions.calendarName,
                      calendarId: calOptions.calendarId
                          //calOptions: calOptions
                  }).then(function (result) {
                       console.log('successfully added week to calendar');
                  }, function (err) {
                      success = false;
                  });*/
      console.log('Added ' + element.summary + ', ' + element.startDate.toLocaleDateString());
    }

    // loop all weeks
    for (var i = 1; i < $scope.reminder.weeks; i++) {
      // get next weeks appointments
      //Timetables.getWeek($scope.groupInfo.group, i, getAppointments(result));
    }

    if (success) {
      $cordovaToast.show('Calendar events successfully added!', toastOptions.duration, toastOptions.position);
    } else {
      $cordovaToast.show('Failed to add calendar events!', toastOptions.duration, toastOptions.position);
    }
  };
}]);

// TODO
lukkariControllers.controller('SearchCtrl', ['$scope', 'LocalStorage', function ($scope, LocalStorage) {}]);
'use strict';

var lukkariDirectives = angular.module('lukkari.directives', []);

lukkariDirectives.directive('dayRange', function () {
  return {
    template: '{{lesson.startDay.toLocaleTimeString' + '("fi-FI", {hour:"numeric", minute:"numeric"})}}' + ' — ' + '{{lesson.endDay.toLocaleTimeString' + '("fi-FI", {hour:"numeric", minute:"numeric"})}}'
  };
});
'use strict';

var lukkariServices = angular.module('lukkari.services', []);

lukkariServices.factory('LocalStorage', [function () {
  function get(name) {
    return window.localStorage.getItem(name);
  }

  function set(name, value) {
    return window.localStorage.setItem(name, value);
  }

  return {
    get: get,
    set: set
  };
}]);

lukkariServices.factory('MyDate', [function () {
  var DAY_IN_MILLISECONDS = 86400000;

  // returns the monday of the week date object of the given date
  function getMonday(d) {
    d = new Date(d);
    var day = d.getDay();
    var diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  // formats a Date object into a string
  // parameter: date object
  // parameter2: return years boolean
  // return: date string
  // 11.02.2040
  function formatDay(_ref) {
    var day = _ref.day;
    var years = _ref.years;

    var dayString = '';
    dayString += day.getDate();
    dayString += '.';
    dayString += day.getMonth() + 1;
    if (typeof years === 'boolean' && years) {
      dayString += '.';
      dayString += day.getFullYear();
    }
    return dayString;
  }

  function getLocaleDate(_ref2) {
    var day = _ref2.day;
    var years = _ref2.years;

    var options = {
      //weekday: 'long',
      month: 'numeric',
      day: 'numeric'
    };
    if (typeof years === 'boolean' && years) {
      options.year = 'numeric';
    }
    return new Intl.DateTimeFormat('fi-FI', options).format(day);
  }

  function getDayFromDay(_ref3) {
    var currentDay = _ref3.currentDay;
    var offsetDays = _ref3.offsetDays;

    var day = currentDay.getTime();
    // add desired amount of days to the millisecs
    day += offsetDays * DAY_IN_MILLISECONDS;
    // create Date object and set it's time to the millisecs
    var date = new Date();
    date.setTime(day);
    return date;
  }

  // returns a day that is offset from today
  function getDayFromToday(offsetDays) {
    // today in millisecs since the beginning of time (UNIX time)
    var day = Date.now();
    // add desired amount of days to the millisecs
    day += offsetDays * DAY_IN_MILLISECONDS;
    // create Date object and set it's time to the millisecs
    return new Date(day);
  }

  return {
    getMonday: getMonday,
    formatDay: formatDay,
    getDayFromToday: getDayFromToday,
    getLocaleDate: getLocaleDate,
    getDayFromDay: getDayFromDay
  };
}]);

lukkariServices.factory('Lessons', ['$http', 'ApiEndpoint', function ($http, ApiEndpoint) {
  var lessons = [];
  var savedGroupName = '';

  function parseLesson(element, index, array) {
    var lesson = {};
    lesson.id = index;
    lesson.startDay = new Date(element.startDate);
    lesson.endDay = new Date(element.endDate);
    lesson.groups = [];
    // parse the resources array
    var resources = element.resources;

    resources.forEach(function (resource, index, array) {
      switch (resource.type) {
        case 'realization':
          lesson.code = resource.code;
          lesson.name = resource.name;
          break;
        case 'room':
          lesson.room = resource.code;
          break;
        case 'student_group':
          lesson.groups.push(resource.code);
          break;
      }
    });
    lessons.push(lesson);
  }

  function get(callback) {
    var data = {
      studentGroup: [savedGroupName]
    };
    var apiKey = 'Wu47zzKEPa7agvin47f5';
    var url = ApiEndpoint.url + '/reservation/search' + '?apiKey=' + apiKey;
    $http({
      method: 'POST',
      url: url,
      data: data,
      withCredentials: true,
      headers: {
        'authorization': 'Basic V3U0N3p6S0VQYTdhZ3ZpbjQ3ZjU6',
        'accept-language': 'fi',
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }
    }).success(function (data, status, headers, config) {
      //console.log(data.reservations);
      console.log('success');
      //console.log(data.reservations);
      //console.log(data);
      lessons = [];
      data.reservations.forEach(parseLesson);
      callback({
        success: false
      });
    }).error(function (data, status, headers, config) {
      console.log('failure');
      callback({
        success: false
      });
    });
  }

  // private get method that just saves lessons
  // change group name method that changes group anme and uses private get method
  function changeGroup(_ref4) {
    var groupName = _ref4.groupName;
    var callback = _ref4.callback;

    savedGroupName = groupName.toUpperCase();
    get(function (result) {
      callback(result);
    });
  }

  // get day method that returns one day's lessons using date
  function getDay(_ref5) {
    var callback = _ref5.callback;
    var day = _ref5.day;

    if (!day || !day instanceof Date) {
      console.error('Error in date!');
      callback({
        success: false
      });
    } else {
      var dayLessons = [];

      //  console.log('lessons: ' + lessons.length);
      lessons.forEach(function (lesson, index, array) {
        var date = lesson.startDay;
        if (date.getDate() === day.getDate() && date.getMonth() === day.getMonth()) {
          dayLessons.push(lesson);
        }
      });
      //console.log('matching lesson: ' + dayLessons);
      //console.log('matching lesson amount: ' + dayLessons.length);
      callback({
        success: true,
        dayLessons: dayLessons
      });
    }
  }

  // get week method that returns one week's lessons using startDate and week offset
  function getWeek(_ref6) {
    var callback = _ref6.callback;
    var day = _ref6.day;
  }

  //get day to day method that returns all appointments from day a to day b
  function getDayToDay(_ref7) {
    var callback = _ref7.callback;
    var startDate = _ref7.startDate;
    var endDate = _ref7.endDate;
  }

  return {
    changeGroup: changeGroup,
    getDay: getDay,
    getWeek: getWeek,
    getDayToDay: getDayToDay
  };
}]);