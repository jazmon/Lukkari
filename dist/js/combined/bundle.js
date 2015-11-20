'use strict';

var lukkariApp = angular.module('lukkari', ['ionic', 'lukkari.controllers', 'lukkari.services', 'ionic-datepicker']);

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
lukkariControllers.controller('TodayCtrl', ['$scope', '$ionicLoading', 'LocalStorage', '$ionicModal', 'MyDate', function ($scope, $ionicLoading, LocalStorage, $ionicModal, MyDate) {
  $scope.groupInfo = {};
  $scope.groupInfo.group = LocalStorage.get('groupName');
  $scope.dayOffset = 0;
  $scope.currentDay = 'Today';

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
    /*$ionicLoading.show({
      template: 'Loading...'
    });*/
    /*Timetables.getDay($scope.groupInfo.group, $scope.dayOffset,
      function(result) {
        $scope.appointments = result;
        $ionicLoading.hide();
      });*/
  };

  $scope.appointments = [];
  if ($scope.groupInfo.group !== undefined) {}
  /*$ionicLoading.show({
    template: 'Loading...'
  });*/
  /*Timetables.getDay($scope.groupInfo.group, $scope.dayOffset,
    function(result) {
      $scope.appointments = result;
      $ionicLoading.hide();
    });*/

  // Moves a day forwards/backwards
  $scope.moveDay = function (direction) {
    // change the offset from current day
    if (direction === -1) {
      $scope.dayOffset -= 1;
    } else if (direction === 1) {
      $scope.dayOffset += 1;
    } else {
      throw new RangeError('Parameter out of range! Please use 1 or -1');
    }
    var date = MyDate.getDayFromToday($scope.dayOffset);
    $scope.currentDay = MyDate.getLocaleDate(date, false);
    /*$ionicLoading.show({
      template: 'Loading...'
    });*/
    $scope.appointments = [];
    /*Timetables.getDay($scope.groupInfo.group, $scope.dayOffset,
      function(result) {
        $scope.appointments = result;
        $ionicLoading.hide();
      });*/
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
  function formatDay(day, years) {
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

  function getLocaleDate(day, years) {
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

  function getDayFromDay(currentDay, offsetDays) {
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

  function get(groupName, callback) {
    if (savedGroupName === groupName) {
      callback(lessons);
    } else {
      savedGroupName = groupName;
      var data = {
        studentGroup: [groupName.toUpperCase()]
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
        console.log(data.reservations);
        callback(data.reservations);
      }).error(function (data, status, headers, config) {
        callback({
          success: false
        });
      });
    }
  }

  return {
    get: get
  };
}]);

// POST: https://lukkarit.tamk.fi/teeHaku.php
// searches the db for matches
// formdata:
// hakukohde=&hakukohde=nimi_koodi&hakusana=k%C3%A4ytett%C3%A4vyys
// https://lukkarit.tamk.fi/paivitaKori.php?toiminto=refresh&code=false&viewReply=true
// response --> html
// updates the basket with the results (html)
// https://lukkarit.tamk.fi/toteutusInfo.php?code=4A00CN36-3004
// response --> html
// shows info about the course when one is clicked in the basket(html)

/*lukkariServices.factory('Timetables', ['$http', 'ical', '$cookies',
  'ApiEndpoint', 'MyDate',
  function($http, ical, $cookies, ApiEndpoint, MyDate) {
    var appointments = [];

    // Generates perfect ical, BUT at least android doesn't support adding a calendar
    // so it's unused.
    function toICAL() {
      var vCal = new ical.Component(['vcalendar', [],
        []
      ]);
      vCal.updatePropertyWithValue('prodid', '-//Lukkari generated calendar');
      // create new component for each appointment
      for (var i = 0; i < appointments.length; i++) {
        var vEvent = new ical.Component('vevent');
        var event = new ical.Event(vEvent);

        // set properties
        event.summary = appointments[i].summary + ' ' +
          appointments[i].courseNumber;
        event.status = 'ACCEPTED';
        event.organizer = appointments[i].teacher;
        event.location = appointments[i].location;
        vEvent.addPropertyWithValue('dtstart',
          ical.Time.fromJSDate(appointments[i].startDate));
        vEvent.addPropertyWithValue('dtend',
          ical.Time.fromJSDate(appointments[i].endDate));

        // create alarm
        var valarm = new ical.Component('valarm');
        valarm.addPropertyWithValue('trigger', '-PT10M');
        valarm.addPropertyWithValue('action', 'DISPLAY');
        valarm.addPropertyWithValue('description', 'Reminder');

        // add alarm to evenet
        vEvent.addSubcomponent(valarm);

        // add element to cal
        vCal.addSubcomponent(vEvent);
      }

      //console.log(vCal.toString());
      return vCal.toString();
    }

    // make a http get request that adds the group to the shopping bin
    //, using proxy if needed (in development)
    // and use credentials so that cookies are used.
    function makeRequest(groupName, startDate, endDate, callback) {
      // clear appointments
      appointments = [];
      // remove phpsessid cookie, because the server
      // piles the groups into a 'shopping basket'
      $cookies.remove('PHPSESSID');
      $http({
        method: 'GET',
        url: ApiEndpoint.url + '/paivitaKori.php?toiminto=addGroup&code=' +
          groupName.toUpperCase(),
        withCredentials: true
      }).then(function(response) {
        // after we get response do new query that gets the ical
        $http({
          method: 'GET',
          url: ApiEndpoint.url + '/icalcreator.php?startDate=' +
            MyDate.formatDay(startDate, true) + '&endDate=' +
            MyDate.formatDay(endDate, true)
        }).then(function(response) {
          // get the ical from the response and parse it
          var events = getEvents(response.data);
          for (var i = 0; i < events.length; i++) {
            var appointment = parseEvent(events[i], i);
            appointments.push(appointment);
          }

          // call callback function when finished
          callback(appointments);
        });
      });
    }

    // returns weeks appointments
    function getWeek(groupName, weekOffset, callback) {
      var thisMonday = MyDate.getMonday(new Date());
      var monday = MyDate.getDayFromDay(thisMonday, weekOffset * 6);
      var sunday = MyDate.getDayFromDay(monday, 6);
      makeRequest(groupName, monday, sunday, callback);
    }

    // returns days appointments
    function getDay(groupName, dayOffset, callback) {
      var day = MyDate.getDayFromToday(dayOffset);
      makeRequest(groupName, day, day, callback);
    }

    // returns appointment with properties
    function parseEvent(vEvent, index) {
      var appointment = {};
      var event = new ical.Event(vEvent);
      // try to parse the ical into logical components...
      appointment.summary = (event.summary.split(/[0-9]+/)[0]);
      appointment.courseNumber =
        (event.summary.slice(appointment.summary.length));
      // TODO could make this into array, and loop in views for each piece...
      appointment.location = (event.location.split(' - ')[0]);
      // try to split location into nicer bits, might fail
      // it's not standardized..
      try {
        appointment.locationInfo = (event.location
          .slice(appointment.location.length + 2)).split(', ')[0];
        appointment.locationInfo2 = (event.location
          .slice(appointment.location.length + 2)).split(', ')[1];
      } catch (e) {
        appointment.locationInfo = event.location;
      }

      // try to get teacher from description
      // might fail, it isn't standardized ...
      try {
        appointment.teacher = (event.description
          .split(/Henkilö\(t\): /)[1]).split(/Ryhmä\(t\): /)[0];
        appointment.teacher = appointment.teacher;
      } catch (e) {
        appointment.teacher = event.description;
      }

      // try to parse group name, but it may fail.
      // this field isn't standardized for some reason..
      try {
        appointment.groups = (event.description
          .slice((event.description
            .split(/Ryhmä\(t\): /)[0]).length)).split(/Ryhmä\(t\): /)[1];
      } catch (e) {
        appointment.groups = event.description;
      }
      appointment.groups = appointment.groups;

      // trim all fields (they are messy as fuck)
      for (var key in appointment) {
        appointment[key] = appointment[key].trim();
      }

      appointment.id = index;
      // https://github.com/mozilla-comm/ical.js/wiki/Parsing-basic-iCalendar
      appointment.startDate = event.startDate.toJSDate();
      appointment.endDate = event.endDate.toJSDate();
      appointment.day = event.startDate.dayOfWeek() - 2;
      return appointment;
    }

    // returns array containing vEvents from the ical
    function getEvents(icalData) {
      // parse ical to vCal format
      var vCal = ical.parse(icalData);
      // extract the vcal (needed for this to work, lol)
      var comp = new ical.Component(vCal);
      // return all vevents
      return comp.getAllSubcomponents();
    }

    // returns an appointment with id (for the single appointment view)
    function getAppointment(id) {
      return appointments[id];
    }

    return {
      getWeek: getWeek,
      getAppointment: getAppointment,
      getDay: getDay,
      toICAL: toICAL
    };
  }
]);*/