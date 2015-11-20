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
  url: 'https://opendata.tamk.fi/r1'
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
  }).state('app.todayLesson', {
    url: '/today/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/lesson.html',
        controller: 'LessonCtrl'
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
  }).state('app.lesson', {
    url: '/week/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/lesson.html',
        controller: 'LessonCtrl'
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

  function getAppointments() {
    $ionicLoading.show({
      template: 'Loading...'
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
  }

  // sets the group
  $scope.setGroup = function () {
    LocalStorage.set('groupName', $scope.groupInfo.group);
    $scope.modal.hide();

    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        if (success) {
          getAppointments();
        } else {
          console.log('failed to change group name');
        }
      }
    });
  };

  $scope.lessons = [];
  if ($scope.groupInfo.group !== undefined) {
    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        if (success) {
          getAppointments();
        } else {
          console.log('failed to change group name');
        }
      }
    });
  }

  // Moves a day forwards/backwards
  $scope.moveDay = function (direction) {
    $scope.currentDay = MyDate.getDayFromDay({
      currentDay: $scope.currentDay,
      offsetDays: direction
    });

    getAppointments();
  };
}]);

// controller for single appointment view
lukkariControllers.controller('LessonCtrl', ['$scope', '$ionicLoading', '$stateParams', 'Lessons', function ($scope, $ionicLoading, $stateParams, Lessons) {
  $scope.lesson = Lessons.getLesson($stateParams.id);
}]);

// controller for weekly view
lukkariControllers.controller('WeekCtrl', ['$scope', '$ionicLoading', '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons', function ($scope, $ionicLoading, $ionicModal, LocalStorage, MyDate, Lessons) {
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
    $ionicLoading.show({
      template: 'Loading...'
    });
    // get all the appointments
    Lessons.getWeek({
      day: $scope.currentDate,
      callback: function callback(response) {
        $ionicLoading.hide();
        if (!response.success) {
          console.log('ERROR');
        } else {
          var allLessons = response.weekLessons;
          console.log(allLessons.length);
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
              if (lesson.startDay.toDateString() === day.date.toDateString()) {
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

  // sets the group name
  $scope.setGroup = function () {
    LocalStorage.set('groupName', $scope.groupInfo.group);
    $scope.modal.hide();

    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        if (success) {
          console.log('successfully changed group name');
          getAppointments();
        } else {
          console.log('failed to change group name');
        }
      }
    });
  };

  $scope.lessons = [];
  if ($scope.groupInfo.group !== undefined) {
    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        if (success) {
          console.log('successfully changed group name');
          getAppointments();
        } else {
          console.log('failed to change group name');
        }
      }
    });
  }

  // moves a week forwards/backwards
  $scope.moveWeek = function (direction) {
    $scope.currentDate = MyDate.getDayFromDay({
      currentDay: $scope.currentDate,
      offsetDays: 7 * direction
    });
    $scope.endDate = MyDate.getDayFromDay({
      currentDay: $scope.currentDate,
      offsetDays: 4
    });

    getAppointments();
  };
}]);

lukkariControllers.controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform', '$timeout', '$cordovaCalendar', 'Lessons', 'MyDate', function ($scope, LocalStorage, $cordovaToast, $ionicPlatform, $timeout, $cordovaCalendar, Lessons, MyDate) {
  $scope.groupInfo = {};
  $scope.reminder = {};
  $scope.reminder.startDay = new Date();
  $scope.reminder.endDay = new Date();

  var toastOptions = {
    duration: 'long',
    position: 'center'
  };

  function datePickerCallback(val) {
    if (typeof val === 'undefined') {
      console.log('No date selected');
    } else {
      console.log('Selected date is : ', val);
      $scope.reminder.startDay = val;
      $scope.datepickerObject.inputDate = val;
    }
  }

  function datePickerCallback2(val) {
    if (typeof val === 'undefined') {
      console.log('No date selected');
    } else {
      console.log('Selected date is : ', val);
      $scope.reminder.endDay = val;
      $scope.datepickerObject2.inputDate = val;
    }
  }

  // https://github.com/rajeshwarpatlolla/ionic-datepicker
  $scope.datepickerObject = {
    titleLabel: 'Select Start Date', //Optional
    todayLabel: 'Today', //Optional
    closeLabel: 'Close', //Optional
    setLabel: 'Set', //Optional
    setButtonType: 'button-positive', //Optional
    todayButtonType: 'button-stable', //Optional
    closeButtonType: 'button-stable', //Optional
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
    callback: function callback(val) {
      //Mandatory
      datePickerCallback(val);
    },
    dateFormat: 'dd-MM-yyyy', //Optional
    closeOnSelect: true };

  //Optional
  $scope.datepickerObject2 = {
    titleLabel: 'Select End Date', //Optional
    todayLabel: 'Today', //Optional
    closeLabel: 'Close', //Optional
    setLabel: 'Set', //Optional
    setButtonType: 'button-positive', //Optional
    todayButtonType: 'button-stable', //Optional
    closeButtonType: 'button-stable', //Optional
    inputDate: $scope.reminder.endDay, //Optional
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
      datePickerCallback2(val);
    },
    dateFormat: 'dd-MM-yyyy', //Optional
    closeOnSelect: true };

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
        $cordovaToast.show('Group successfully changed!', toastOptions.duration, toastOptions.position);
      } catch (e) {
        // do nothing because it fails on browser
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

    function createEvent(element, index, array) {
      var groups = '';
      for (var i = 0; i < element.groups.length; i++) {
        groups += element.groups[i] + ', ';
      }

      $cordovaCalendar.createEventWithOptions({
        title: element.name,
        location: element.room,
        notes: 'Teacher(s): ' + element.teacher + '\nGroup(s): ' + groups + '\nCourse: ' + element.code,
        startDate: element.startDay,
        endDate: element.endDay,
        firstReminderMinutes: calOptions.firstReminderMinutes,
        secondReminderMinutes: calOptions.secondReminderMinutes,
        calendarName: calOptions.calendarName,
        calendarId: calOptions.calendarId
        //calOptions: calOptions
      }).then(function (result) {
        console.log('successfully added week to calendar');
      }, function (err) {
        success = false;
        console.log('failed to add to calendar');
      });
    }

    Lessons.getDayToDay({
      startDate: $scope.reminder.startDay,
      endDate: $scope.reminder.endDay,
      callback: function callback(response) {
        $ionicPlatform.ready(function () {
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

    $cordovaToast.show(msg, toastOptions.duration, toastOptions.position);
    console.log(msg);
  };
}]);

// TODO
lukkariControllers.controller('SearchCtrl', ['$scope', 'LocalStorage', function ($scope, LocalStorage) {}]);
'use strict';

var lukkariDirectives = angular.module('lukkari.directives', []);

lukkariDirectives.directive('timeRange', function () {
  return {
    template: '{{lesson.startDay.toLocaleTimeString' + '("fi-FI", {hour:"numeric", minute:"numeric"})}}' + ' — ' + '{{lesson.endDay.toLocaleTimeString' + '("fi-FI", {hour:"numeric", minute:"numeric"})}}'
  };
});

lukkariDirectives.directive('date', function () {
  return {
    template: '{{day.date.toLocaleDateString("fi-FI",' + ' {weekday: "short", day: "numeric", month:"numeric"})}}'
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

  function getLocaleDate(_ref) {
    var day = _ref.day;
    var years = _ref.years;

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

  function getDayFromDay(_ref2) {
    var currentDay = _ref2.currentDay;
    var offsetDays = _ref2.offsetDays;

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
    getDayFromToday: getDayFromToday,
    getLocaleDate: getLocaleDate,
    getDayFromDay: getDayFromDay
  };
}]);

lukkariServices.factory('Lessons', ['$http', 'ApiEndpoint', 'MyDate', function ($http, ApiEndpoint, MyDate) {
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
          lesson.roomInfo = resource.parent.name;
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
      console.log('success');
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
  function changeGroup(_ref3) {
    var groupName = _ref3.groupName;
    var callback = _ref3.callback;

    savedGroupName = groupName.toUpperCase();
    get(function (result) {
      callback(result);
    });
  }

  // get day method that returns one day's lessons using date
  function getDay(_ref4) {
    var callback = _ref4.callback;
    var day = _ref4.day;

    if (!day || !day instanceof Date) {
      console.error('Error in date!');
      callback({
        success: false
      });
    } else {
      var dayLessons = [];
      lessons.forEach(function (lesson, index, array) {
        var date = lesson.startDay;
        if (date.getDate() === day.getDate() && date.getMonth() === day.getMonth()) {
          dayLessons.push(lesson);
        }
      });
      callback({
        success: true,
        dayLessons: dayLessons
      });
    }
  }

  // get week method that returns one week's lessons using startDate and week offset
  function getWeek(_ref5) {
    var callback = _ref5.callback;
    var day = _ref5.day;

    var weekLessons = [];
    var startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    var endDate = MyDate.getDayFromDay({
      currentDay: day,
      offsetDays: 5
    });
    lessons.forEach(function (lesson, index, array) {
      if (lesson.startDay >= startDate && lesson.startDay <= endDate) {
        weekLessons.push(lesson);
      }
    });
    callback({
      success: true,
      weekLessons: weekLessons
    });
  }

  //get day to day method that returns all appointments from day a to day b
  function getDayToDay(_ref6) {
    var callback = _ref6.callback;
    var startDate = _ref6.startDate;
    var endDate = _ref6.endDate;

    var correctEndDate = MyDate.getDayFromDay({
      currentDay: endDate,
      offsetDays: 1
    });
    var retLessons = [];
    lessons.forEach(function (lesson, index, array) {
      if (lesson.startDay >= startDate && lesson.startDay <= correctEndDate) {
        retLessons.push(lesson);
      }
    });
    callback({
      success: true,
      lessons: retLessons
    });
  }

  function getLesson(id) {
    return lessons[id];
  }

  return {
    changeGroup: changeGroup,
    getDay: getDay,
    getWeek: getWeek,
    getDayToDay: getDayToDay,
    getLesson: getLesson
  };
}]);