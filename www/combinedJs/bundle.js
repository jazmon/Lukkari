'use strict';

angular.module('lukkari', ['ionic', 'lukkari.controllers', 'lukkari.services', 'lukkari.directives', 'ionic-datepicker', 'ionic-material', 'angularXml2json']).run(['$ionicPlatform', function ($ionicPlatform) {
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
  url: 'http://localhost:8100/api'
}).constant('LunchEndPoint', {
  url: 'http://localhost:8100/lunch'
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
var loadingTemplate = '<div class="loader"><svg class="circular">' + '<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2"' + ' stroke-miterlimit="10"/></svg></div>';
angular.module('lukkari.directives', []);
'use strict';

angular.module('lukkari.services').factory('FoodService', ['$http', 'LunchEndPoint', 'ngXml2json', function ($http, LunchEndPoint, ngXml2json) {
  var lunches = [];

  function parseLunch(element, index, array) {
    var i;
    var j;
    var lunch = {};
    // get date
    lunch.date = new Date(element.div[0].span.content[0]);
    // get dishes
    lunch.dishes = [];
    // remove 3 from length to ignore evening foods
    var length = element.div[1].div.length - 3;
    for (i = 0; i < length; i++) {
      var dish = {};
      dish.pricegroups = [];
      dish.allergies = [];
      dish.name = element.div[1].div[i].div.div.ul.li.div.div.div[0].div.div.content;
      if (dish.name.includes('Ravintola avoinna')) {
        continue;
      }
      // get pricing info
      // var length2;
      // try {
      //   length2 = element.div[1].div[i].div.div.ul.li.div.div.div[1].div
      //     .div.div.div.length;
      // } catch (e) {
      //   length2 = 0;
      // }
      //
      // for (j = 0; j < length2; j++) {
      //   var pricegroup = {};
      //   try {
      //     pricegroup.group = element.div[1].div[i].div.div.ul.li.div.div.div[
      //       1].div.div.div.div[j].div[0].div.div.p;
      //   } catch (e) {
      //     pricegroup.group = 'N/A';
      //   }
      //   try {
      //     pricegroup.price = element.div[1].div[i].div.div.ul.li.div.div.div[
      //       1].div.div.div.div[j].div[1].div.div.content;
      //   } catch (e) {
      //     pricegroup.price = '';
      //   }
      //
      //   dish.pricegroups.push(pricegroup);
      // }
      // // var pricegroup = {};
      // // pricegroup.group = element.div[1].div[i].div.div.ul.li.div.div.div[
      // //   1].div.div.div.div[j].div.div.div.p;
      // // pricegroup.price = element.div[1].div[i].div.div.ul.li.div.div.div[
      // //   1].div.div.div.div[j].div.div.div.p;
      //
      // // get allergy info
      // var length3 = element.div[1].div[i].div.div.ul.li.div.div.div[1].div
      //   .div.length;
      // for (j = 0; j < length3; j++) {
      //   var allergy = element.div[1].div[i].div.div.ul.li.div.div.div[1].div
      //     .div[j].div.div[0].div.div.p;
      //   dish.allergies.push(allergy);
      // }
      lunch.dishes.push(dish);
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
        url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fcampusravita.fi%2Fruokalista%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22view-grouping%22%5D'&format=json&diagnostics=true&callback="
      }).then(function successCallback(response) {
        var data = response.data.query.results.div;
        data.forEach(parseLunch);
        callback(lunches);
      }, function errorCallback(response) {});
    }
  }

  return {
    get: get
  };
}]);
'use strict';

angular.module('lukkari.services').factory('Lessons', ['$http', 'ApiEndpoint', 'MyDate', function ($http, ApiEndpoint, MyDate) {
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
  function changeGroup(_ref) {
    var groupName = _ref.groupName;
    var callback = _ref.callback;

    savedGroupName = groupName.toUpperCase();
    get(function (result) {
      callback(result);
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
  function getWeek(_ref3) {
    var callback = _ref3.callback;
    var day = _ref3.day;

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
  function getDayToDay(_ref4) {
    var callback = _ref4.callback;
    var startDate = _ref4.startDate;
    var endDate = _ref4.endDate;

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
'use strict';

angular.module('lukkari.services').factory('LocalStorage', [function () {
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
'use strict';

angular.module('lukkari.directives').directive('date', function () {
  return {
    template: '{{day.date.toLocaleDateString("fi-FI",' + ' {weekday: "short", day: "numeric", month:"numeric"})}}'
  };
});
'use strict';

angular.module('lukkari.directives').directive('ngLastRepeat', function ($timeout) {
  return {
    restrict: 'A',
    link: function link(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit('ngLastRepeat' + (attr.ngLastRepeat ? '.' + attr.ngLastRepeat : ''));
        });
      }
    }
  };
});
'use strict';

angular.module('lukkari.directives').directive('timeRange', function () {
  return {
    template: '{{lesson.startDay.toLocaleTimeString' + '("fi-FI", {hour:"numeric", minute:"numeric"})}}' + ' — ' + '{{lesson.endDay.toLocaleTimeString' + '("fi-FI", {hour:"numeric", minute:"numeric"})}}'
  };
});
'use strict';

angular.module('lukkari.controllers')
// controller for single appointment view
.controller('LessonCtrl', ['$scope', '$ionicLoading', '$stateParams', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, $ionicLoading, $stateParams, Lessons, ionicMaterialInk, ionicMaterialMotion) {
  $scope.lesson = Lessons.getLesson($stateParams.id);
}]);
'use strict';

angular.module('lukkari.controllers').controller('LukkariCtrl', ['$scope', function ($scope) {}]);
'use strict';

angular.module('lukkari.controllers').controller('LunchCtrl', ['$scope', 'FoodService', 'ionicMaterialInk', 'ionicMaterialMotion', '$ionicLoading', function ($scope, FoodService, ionicMaterialInk, ionicMaterialMotion, $ionicLoading) {
  $ionicLoading.show({
    template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
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
// TODO
.controller('SearchCtrl', ['$scope', 'LocalStorage', function ($scope, LocalStorage) {}]);
'use strict';

angular.module('lukkari.controllers').controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform', '$timeout', '$cordovaCalendar', 'Lessons', 'MyDate', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, LocalStorage, $cordovaToast, $ionicPlatform, $timeout, $cordovaCalendar, Lessons, MyDate, ionicMaterialInk, ionicMaterialMotion) {
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
      //console.log('No date selected');
    } else {
        //console.log('Selected date is : ', val);
        $scope.reminder.startDay = val;
        $scope.datepickerObject.inputDate = val;
      }
  }

  function datePickerCallback2(val) {
    if (typeof val === 'undefined') {
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
      }).then(function (result) {}, function (err) {
        success = false;
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

  // Set Motion
  ionicMaterialMotion.ripple();

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers')
// controller for today view
.controller('TodayCtrl', ['$scope', '$ionicLoading', 'LocalStorage', '$ionicModal', 'MyDate', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, $ionicLoading, LocalStorage, $ionicModal, MyDate, Lessons, ionicMaterialInk, ionicMaterialMotion) {
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
      template: loadingTemplate
    });

    Lessons.getDay({
      day: $scope.currentDay,
      callback: function callback(response) {
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

  $scope.$on('ngLastRepeat.myList', function (e) {
    ionicMaterialMotion.blinds();
  });

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
          console.error('failed to change group name');
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
          console.error('failed to change group name');
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

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);
'use strict';

angular.module('lukkari.controllers')
// controller for weekly view
.controller('WeekCtrl', ['$scope', '$ionicLoading', '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons', 'ionicMaterialInk', 'ionicMaterialMotion', function ($scope, $ionicLoading, $ionicModal, LocalStorage, MyDate, Lessons, ionicMaterialInk, ionicMaterialMotion) {
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
      template: loadingTemplate
    });
    // get all the appointments
    Lessons.getWeek({
      day: $scope.currentDate,
      callback: function callback(response) {
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
    ionicMaterialMotion.ripple();
  });

  // sets the group name
  $scope.setGroup = function () {
    LocalStorage.set('groupName', $scope.groupInfo.group);
    $scope.modal.hide();

    Lessons.changeGroup({
      groupName: $scope.groupInfo.group,
      callback: function callback(success) {
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
      callback: function callback(success) {
        if (success) {
          getAppointments();
        } else {
          console.error('failed to change group name');
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

  // Set Ink
  ionicMaterialInk.displayEffect();
}]);