'use strict';

angular.module('jm.i18next').config(['$i18nextProvider', function ($i18nextProvider) {
  $i18nextProvider.options = {
    lng: 'dev', // If not given, i18n will detect the browser language.
    useCookie: false,
    useLocalStorage: true,
    fallbackLng: 'dev',
    resGetPath: './locales/__lng__/__ns__.json',
    defaultLoadingValue: '',
    localStorageExpirationTime: 1000 // NOTE remove for production
  };
}]);

angular.module('lukkari', ['ionic', 'lukkari.controllers', 'lukkari.services', 'lukkari.directives', 'ionic-datepicker', 'ionic-material', 'angularXml2json', 'jm.i18next']).run(['$ionicPlatform', function ($ionicPlatform) {
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
}])

// http://blog.ionic.io/handling-cors-issues-in-ionic/
.constant('ApiEndpoint', {
  url: 'https://opendata.tamk.fi/r1'
}).constant('LunchEndPoint', {
  url: 'http://localhost:8100/lunch'
}).constant('ApiKey', {
  key: 'Wu47zzKEPa7agvin47f5'
})

// menuContent-view is presented on the main view.
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
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
  }).state('app.realization', {
    url: '/search/:code',
    views: {
      'menuContent': {
        templateUrl: 'templates/realization.html',
        controller: 'RealizationCtrl'
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
  }).state('app.lunch', {
    url: '/lunch',
    views: {
      'menuContent': {
        templateUrl: 'templates/lunch.html',
        controller: 'LunchCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/today');
}]);

angular.module('lukkari.services', []);
angular.module('lukkari.controllers', ['ngCordova']);
angular.module('lukkari.directives', []);
'use strict';

angular.module('lukkari.services').factory('FoodService', ['$http', 'LunchEndPoint', 'ngXml2json', function ($http, LunchEndPoint, ngXml2json) {
  var lunches = [];

  function parseLunch(element, index, array) {
    var lunch = {
      main: element.div[0].div.div.content
    };

    if (element.div.length >= 2) {
      lunch.side = element.div[1].div.div.content;
    }
    if (element.div.length >= 3) {
      lunch.allergy = element.div[2].div.div.content;
    }

    lunches.push(lunch);
  }

  function get(_ref) {
    var callback = _ref.callback;

    if (lunches.length > 0) {
      callback(lunches);
    } else {
      $http({
        method: 'GET',
        url: ['https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%', '20html%20where%20url%3D%22http%3A%2F%2Fwww.campusravita.fi%2Fi', 'ntra_menu_today.php%22%20and%0A%20%20%20%20%20%20xpath%3D\'%2F', '%2Fdiv%5B%40class%3D%22rivitys-intra%22%5D\'&format=json&diagn', 'ostics=true&callback='].join('')

      }).then(function successCallback(response) {
        // if no lunches (eg. weekend)
        if (response.data.query.results === null) {
          callback(lunches);
        } else {
          var data = response.data.query.results.div;
          data.forEach(parseLunch);
          callback(lunches);
        }
      }, function errorCallback(response) {});
    }
  }

  return {
    get: get
  };
}]);
'use strict';

angular.module('lukkari.services').factory('Lessons', ['$http', 'ApiEndpoint', 'MyDate', 'ApiKey', function ($http, ApiEndpoint, MyDate, ApiKey) {
  var lessons = [];
  var savedGroupName = undefined;

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
    var url = [ApiEndpoint.url, '/reservation/search', '?apiKey=', ApiKey.key].join('');
    var lang = 'en';
    if (navigator.language.includes('fi')) {
      lang = 'fi';
    }
    $http({
      method: 'POST',
      url: url,
      data: data,
      withCredentials: true,
      headers: {
        'authorization': 'Basic V3U0N3p6S0VQYTdhZ3ZpbjQ3ZjU6',
        'accept-language': lang,
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }
    }).success(function (data, status, headers, config) {
      lessons = [];
      data.reservations.forEach(parseLesson);
      callback({
        success: false
      });
    }).error(function (data, status, headers, config) {
      console.error('Failed to get lesson data!');
      callback({
        success: false
      });
    });
  }

  // private get method that just saves lessons
  // change group name method that changes group anme and uses private get method
  function changeGroup(_ref) {
    var groupName = _ref.groupName;
    var callback = _ref.callback;

    savedGroupName = groupName.toUpperCase();
    get(function (result) {
      return callback(result);
    });
  }

  // get day method that returns one day's lessons using date
  function getDay(_ref2) {
    var callback = _ref2.callback;
    var day = _ref2.day;

    if (!day || !day instanceof Date) {
      console.error('Error in date!');
      callback({
        success: false
      });
    } else {
      (function () {
        var checkDay = function checkDay(lesson, index, array) {
          var date = lesson.startDay;
          if (date.getDate() === day.getDate() && date.getMonth() === day.getMonth()) {
            dayLessons.push(lesson);
          }
        };

        var dayLessons = [];

        lessons.forEach(checkDay);
        callback({
          success: true,
          dayLessons: dayLessons
        });
      })();
    }
  }

  // get week method that returns one week's lessons using startDate and week offset
  function getWeek(_ref3) {
    var callback = _ref3.callback;
    var day = _ref3.day;

    var weekLessons = [];
    var startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    var endDate = MyDate.getDayFromDay({
      currentDay: day,
      offsetDays: 5
    });

    function checkLessonDate(lesson, index, array) {
      if (lesson.startDay >= startDate && lesson.startDay <= endDate) {
        weekLessons.push(lesson);
      }
    }
    lessons.forEach(checkLessonDate);
    callback({
      success: true,
      weekLessons: weekLessons
    });
  }

  //get day to day method that returns all appointments from day a to day b
  function getDayToDay(_ref4) {
    var callback = _ref4.callback;
    var startDate = _ref4.startDate;
    var endDate = _ref4.endDate;

    var correctEndDate = MyDate.getDayFromDay({
      currentDay: endDate,
      offsetDays: 1
    });
    var retLessons = [];

    function checkLesson(lesson, index, array) {
      if (lesson.startDay >= startDate && lesson.startDay <= correctEndDate) {
        retLessons.push(lesson);
      }
    }

    lessons.forEach(checkLesson);
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
'use strict';

angular.module('lukkari.services').factory('LocalStorage', [function () {
  function get(_ref) {
    var key = _ref.key;

    return window.localStorage.getItem(key);
  }

  function set(_ref2) {
    var key = _ref2.key;
    var value = _ref2.value;

    return window.localStorage.setItem(key, value);
  }

  return {
    get: get,
    set: set
  };
}]);
'use strict';

angular.module('lukkari.services').factory('MyDate', [function () {
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
    var weekday = _ref.weekday;

    var options = {
      month: 'numeric',
      day: 'numeric'
    };
    options.year = years ? 'numeric' : undefined;
    options.weekday = weekday ? 'long' : undefined;
    return new Intl.DateTimeFormat('fi-FI', options).format(day);
  }

  function getDayFromDay(_ref2) {
    var currentDay = _ref2.currentDay;
    var offsetDays = _ref2.offsetDays;

    // add desired amount of days to the millisecs
    var day = currentDay.getTime() + offsetDays * DAY_IN_MILLISECONDS;
    // create Date object and set it's time to the millisecs
    var date = new Date();
    date.setTime(day);
    return date;
  }

  // returns a day that is offset from today
  function getDayFromToday(offsetDays) {
    return getDayFromDay({
      currentDay: new Date(),
      offsetDays: offsetDays
    });
  }

  function offsetDate(_ref3) {
    var date = _ref3.date;
    var minutes = _ref3.minutes;
    var hours = _ref3.hours;
    var seconds = _ref3.seconds;

    var d = date;
    // console.log('date: ' + date);
    if (hours) {
      d.setHours(date.getHours() + hours);
    }
    if (minutes) {
      d.setMinutes(date.getMinutes() + minutes);
    }
    if (seconds) {
      d.setSeconds(date.getSeconds() + seconds);
    }
    // console.log('d: ' + d);
    return d;
  }

  return {
    getMonday: getMonday,
    getDayFromToday: getDayFromToday,
    getLocaleDate: getLocaleDate,
    getDayFromDay: getDayFromDay,
    offsetDate: offsetDate
  };
}]);
'use strict';

angular.module('lukkari.services').factory('Notifications', ['LocalStorage', '$ionicPlatform', '$cordovaLocalNotification', 'Lessons', 'MyDate', function (LocalStorage, $ionicPlatform, $cordovaLocalNotification, Lessons, MyDate) {
  function useNotifications(_ref) {
    var use = _ref.use;
    var timeOffset = _ref.timeOffset;

    // get notification ids from local storage
    var notificationIds = JSON.parse(LocalStorage.get({
      key: 'notifications'
    }));
    $ionicPlatform.ready(function () {
      if (use) {
        // remove all
        $cordovaLocalNotification.cancelAll().then(function (result) {
          return console.log(result);
        });
        // add next week from now
        Lessons.getWeek({
          day: new Date(),
          callback: function callback(response) {
            var lessons = response.weekLessons;
            lessons.forEach(function (lesson) {
              var id = undefined;
              if (!notificationIds) {
                id = 0;
                notificationIds = [];
              } else {
                id = notificationIds[notificationIds.length - 1] + 1;
              }
              notificationIds.push(id);
              LocalStorage.set({
                key: 'notifications',
                value: JSON.stringify(notificationIds)
              });
              $cordovaLocalNotification.schedule({
                id: id,
                title: lesson.name,
                text: [lesson.room, ', ', lesson.startDay.toLocaleTimeString('fi-FI', {
                  hour: 'numeric',
                  minute: 'numeric'
                }), ' - ', lesson.endDay.toLocaleTimeString('fi-FI', {
                  hour: 'numeric',
                  minute: 'numeric'
                })].join(''),
                at: MyDate.offsetDate({
                  date: lesson.startDay,
                  minutes: timeOffset
                })
              }).then(function (result) {
                return console.log('SUCCESS: ' + result);
              });
            });
          }
        });
        LocalStorage.set({
          key: 'useNotification',
          value: 'true'
        });
      } else {
        console.log('Removing all notifications');
        $cordovaLocalNotification.cancelAll().then(function (result) {
          return console.log(result);
        });
        LocalStorage.set({
          key: 'useNotification',
          value: 'false'
        });
      }
    });
  }

  return {
    useNotifications: useNotifications
  };
}]);
'use strict';

angular.module('lukkari.services').factory('Search', ['$http', 'ApiEndpoint', 'ApiKey', function ($http, ApiEndpoint, ApiKey) {
  function search(_ref) {
    var name = _ref.name;
    var studentGroups = _ref.studentGroups;
    var startDate = _ref.startDate;
    var endDate = _ref.endDate;
    var codes = _ref.codes;
    var successCallback = _ref.successCallback;
    var errorCallback = _ref.errorCallback;

    var url = [ApiEndpoint.url, '/realization/search', '?apiKey=', ApiKey.key].join('');

    var data = {};
    if (name !== undefined) {
      data.name = name;
    }
    if (studentGroups !== undefined) {
      data.studentGroups = studentGroups;
    }
    if (startDate !== undefined) {
      data.startDate = startDate;
    }
    if (endDate !== undefined) {
      data.endDate = endDate;
    }
    if (codes !== undefined) {
      data.codes = codes;
    }
    var lang = 'en';
    if (navigator.language.includes('fi')) {
      lang = 'fi';
    }
    $http({
      method: 'POST',
      url: url,
      data: data,
      withCredentials: true,
      headers: {
        'authorization': 'Basic V3U0N3p6S0VQYTdhZ3ZpbjQ3ZjU6',
        'accept-language': lang,
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }
    }).success(function (data, status, headers, config) {
      successCallback(data);
    }).error(function (data, status, headers, config) {
      errorCallback(status);
    });
  }
  return {
    search: search
  };
}]);
'use strict';

angular.module('lukkari.directives').directive('date', function () {
  return {
    template: ['{{day.date.toLocaleDateString(', navigator.language, ',', ' {weekday: "short", day: "numeric", month:"numeric"})}}'].join('')
  };
});
'use strict';

angular.module('lukkari.directives').directive('ngLastRepeat', function ($timeout) {
  return {
    restrict: 'A',
    link: function link(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          return scope.$emit('ngLastRepeat' + (attr.ngLastRepeat ? '.' + attr.ngLastRepeat : ''));
        });
      }
    }
  };
});
'use strict';

angular.module('lukkari.directives').directive('timeRange', function () {
  return {
    template: ['{{lesson.startDay.toLocaleTimeString', '(', navigator.language, ', {hour:"numeric", minute:"numeric"})}}', ' — ' + '{{lesson.endDay.toLocaleTimeString', '(', navigator.language, ', {hour:"numeric", minute:"numeric"})}}'].join('')
  };
});
'use strict';

angular.module('lukkari.controllers')
// controller for single appointment view
.controller('LessonCtrl', ['$scope', '$ionicLoading', '$stateParams', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, $ionicLoading, $stateParams, Lessons, ionicMaterialInk) {
  $scope.lesson = Lessons.getLesson($stateParams.id);
  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers').controller('LukkariCtrl', ['$scope', function ($scope) {}]);
'use strict';

angular.module('lukkari.controllers').controller('LunchCtrl', ['$scope', 'FoodService', 'ionicMaterialInk', 'ionicMaterialMotion', '$ionicLoading', function ($scope, FoodService, ionicMaterialInk, ionicMaterialMotion, $ionicLoading) {
  $ionicLoading.show({
    templateUrl: 'templates/loading.html'
  });
  FoodService.get({
    callback: function callback(lunches) {
      $scope.lunches = lunches;
      $ionicLoading.hide();
    }
  });

  $scope.$on('ngLastRepeat.myList', function (e) {
    ionicMaterialMotion.ripple();
  });

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers')
// controller for single appointment view
.controller('RealizationCtrl', ['$scope', '$ionicLoading', '$stateParams', 'Search', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, $ionicLoading, $stateParams, Search, ionicMaterialInk) {
  var searchParams = {
    codes: [$stateParams.code],
    successCallback: function successCallback(data) {
      console.log(data.realizations[0]);
      $scope.realization = data.realizations[0];
      $scope.realization.startDate = new Date($scope.realization.startDate);
      $scope.realization.endDate = new Date($scope.realization.endDate);
      $scope.realization.enrollmentStart = new Date($scope.realization.enrollmentStart);
      $scope.realization.enrollmentEnd = new Date($scope.realization.enrollmentEnd);
    },
    errorCallback: function errorCallback(status) {
      return console.log(status);
    }
  };
  $scope.realization = Search.search(searchParams);
  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers').controller('SearchCtrl', ['$scope', 'LocalStorage', 'Search', '$ionicLoading', '$ionicModal', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, LocalStorage, Search, $ionicLoading, $ionicModal, ionicMaterialInk, ionicMaterialMotion) {
  $scope.searchParams = {
    successCallback: function successCallback(data) {
      console.log(data);
      if (data.realizations.length < 1000) {
        $scope.realizations = data.realizations;
        $scope.realizations.forEach(function (element) {
          element.startDate = new Date(element.startDate);
          element.endDate = new Date(element.endDate);
        });
      } else {
        // show error popup
        console.log('Please enter some search parameters!');
      }
      $ionicLoading.hide();
    },
    errorCallback: function errorCallback(status) {
      return console.log(status);
    }
  };

  $ionicModal.fromTemplateUrl('templates/searchModal.html', {
    scope: $scope
  }).then(function (modal) {
    return $scope.modal = modal;
  });

  $scope.close = function () {
    return $scope.modal.hide();
  };

  $scope.openSearch = function () {
    return $scope.modal.show();
  };

  $scope.search = function () {
    $scope.modal.hide();
    $ionicLoading.show({
      templateUrl: 'templates/loading.html'
    });
    if ($scope.searchParams.code !== undefined && $scope.searchParams.code !== null) {
      $scope.searchParams.codes = [$scope.searchParams.code];
    }
    if ($scope.searchParams.studentGroup !== undefined && $scope.searchParams.studentGroup !== null && $scope.searchParams.studentGroup !== '') {
      $scope.searchParams.studentGroups = [$scope.searchParams.studentGroup.toUpperCase()];
    }
    Search.search($scope.searchParams);
  };

  $scope.$on('ngLastRepeat.myList', function (e) {
    return ionicMaterialMotion.blinds();
  });

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers').controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform', '$timeout', '$cordovaCalendar', 'Lessons', 'MyDate', 'ionicMaterialInk', 'ionicMaterialMotion', '$cordovaLocalNotification', 'Notifications', function ($scope, LocalStorage, $cordovaToast, $ionicPlatform, $timeout, $cordovaCalendar, Lessons, MyDate, ionicMaterialInk, ionicMaterialMotion, $cordovaLocalNotification, Notifications) {
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
  var toastOptions = {
    duration: 'long',
    position: 'center'
  };
  //console.log(i18n.t('lesson.course'));
  // https://github.com/rajeshwarpatlolla/ionic-datepicker
  $scope.datepickerObject = {
    titleLabel: i18n.t('date_picker.select_start_date'), //Optional
    todayLabel: i18n.t('date_picker.today'), //Optional
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
    callback: function callback(val) {
      //Mandatory
      if (typeof val === 'undefined') {
        //console.log('No date selected');
      } else {
          $scope.reminder.startDay = val;
          $scope.datepickerObject.inputDate = val;
        }
    },
    dateFormat: 'dd-MM-yyyy', //Optional
    closeOnSelect: true };
  //Optional
  $scope.datepickerObject2 = {
    titleLabel: i18n.t('date_picker.select_end_date'), //Optional
    todayLabel: i18n.t('date_picker.select_start_date'), //Optional
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
    callback: function callback(val) {
      //Mandatory
      if (typeof val === 'undefined') {
        //console.log('No date selected');
      } else {
          $scope.reminder.endDay = val;
          $scope.datepickerObject2.inputDate = val;
        }
    },
    dateFormat: 'dd-MM-yyyy', //Optional
    closeOnSelect: true };

  //Optional
  $scope.changeGroup = function () {
    LocalStorage.set({
      key: 'groupName',
      value: $scope.groupInfo.group
    });
    // show toast that change was successful
    $ionicPlatform.ready(function () {
      $cordovaToast.show(i18n.t('settings.group_change_successful'), toastOptions.duration, toastOptions.position);
      // change to today view after 2 seconds
      $timeout(function () {
        return window.location.href = '#/app/today';
      }, 2000);
    });
  };

  $scope.setNotification = function () {
    Notifications.useNotifications({
      use: $scope.notification.use,
      timeOffset: -$scope.notification.time
    });
  };

  $scope.addToCalendar = function () {
    var appointments = [];
    var calOptions = {
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

    var success = true;

    function createEvent(element, index, array) {
      var groups = '';
      for (var i = 0; i < element.groups.length; i++) {
        groups += element.groups[i] + ', ';
      }

      var notes = [i18n.t('settings.course_name'), element.code, '\n', i18n.t('settings.group'), groups].join('');
      $cordovaCalendar.createEventWithOptions({
        title: element.name,
        location: element.room,
        notes: notes,
        startDate: element.startDay,
        endDate: element.endDay,
        firstReminderMinutes: calOptions.firstReminderMinutes,
        secondReminderMinutes: calOptions.secondReminderMinutes,
        calendarName: calOptions.calendarName,
        calendarId: calOptions.calendarId
        //calOptions: calOptions
      }).then(function (result) {}, function (err) {
        success = false;
      });
    }

    Lessons.getDayToDay({
      startDate: $scope.reminder.startDay,
      endDate: $scope.reminder.endDay,
      callback: function callback(response) {
        $ionicPlatform.ready(function () {
          return response.lessons.forEach(createEvent);
        });
      }
    });
    var msg = '';
    if (success) {
      msg = i18n.t('settings.success_message');
    } else {
      msg = i18n.t('settings.failure_message');
    }

    $cordovaToast.show(msg, toastOptions.duration, toastOptions.position);
    console.log(msg);
  };

  // Set Motion
  ionicMaterialMotion.ripple();

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers')
// controller for today view
.controller('TodayCtrl', ['$scope', '$ionicLoading', 'LocalStorage', '$ionicModal', 'MyDate', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion', 'Notifications', function ($scope, $ionicLoading, LocalStorage, $ionicModal, MyDate, Lessons, ionicMaterialInk, ionicMaterialMotion, Notifications) {
  $scope.groupInfo = {
    group: LocalStorage.get({
      key: 'groupName'
    })
  };
  $scope.currentDay = new Date();

  var useNotifications = LocalStorage.get({
    key: 'useNotification'
  });
  //console.log(useNotifications);
  if (useNotifications == true) {
    console.log('setting notifications');
    Notifications.useNotifications({
      use: $scope.notification.use,
      timeOffset: -$scope.notification.time
    });
  }

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
    return $scope.modal.hide();
  };

  function getAppointments() {
    $ionicLoading.show({
      templateUrl: 'templates/loading.html'
    });

    Lessons.getDay({
      day: $scope.currentDay,
      callback: function callback(response) {
        $ionicLoading.hide();
        if (!response.success) {
          console.error('ERROR');
        } else {
          $scope.lessons = response.dayLessons;
        }
      }
    });
  }

  $scope.$on('ngLastRepeat.myList', function (e) {
    return ionicMaterialMotion.blinds();
  });

  // sets the group
  $scope.setGroup = function () {
    LocalStorage.set({
      key: 'groupName',
      value: $scope.groupInfo.group
    });
    $scope.modal.hide();

    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        return success ? getAppointments() : console.error('failed to change group name');
      }
    });
  };

  $scope.lessons = [];
  if ($scope.groupInfo.group !== undefined && $scope.groupInfo.group !== null) {
    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        return success ? getAppointments() : console.error('failed to change group name');
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

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers')
// controller for weekly view
.controller('WeekCtrl', ['$scope', '$ionicLoading', '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, $ionicLoading, $ionicModal, LocalStorage, MyDate, Lessons, ionicMaterialInk, ionicMaterialMotion) {
  $scope.groupInfo = {
    group: LocalStorage.get({
      key: 'groupName'
    })
  };
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
    return $scope.modal.hide();
  };

  // returns all of the appointments
  function getAppointments() {
    // show the loading window
    $ionicLoading.show({
      templateUrl: 'templates/loading.html'
    });
    // get all the appointments
    Lessons.getWeek({
      day: $scope.currentDate,
      callback: function callback(response) {
        $ionicLoading.hide();
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

  $scope.$on('ngLastRepeat.myList', function (e) {
    return ionicMaterialMotion.ripple();
  });

  // sets the group name
  $scope.setGroup = function () {
    LocalStorage.set({
      key: 'groupName',
      value: $scope.groupInfo.group
    });
    $scope.modal.hide();

    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        return success ? getAppointments() : console.error('failed to change group name');
      }
    });
  };

  $scope.lessons = [];
  if ($scope.groupInfo.group !== undefined) {
    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
        return success ? getAppointments() : console.error('failed to change group name');
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

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);