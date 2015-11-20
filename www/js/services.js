var lukkariServices = angular.module('lukkari.services',
 []);

lukkariServices.factory('LocalStorage',
[function() {
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

lukkariServices.factory('MyDate',
[function() {
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
    dayString += (day.getMonth() + 1);
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

lukkariServices.factory('Lessons',
['$http', 'ApiEndpoint',
  function($http, ApiEndpoint) {
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
        var url = ApiEndpoint.url + '/reservation/search' +
          '?apiKey=' + apiKey;
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
        }).success(function(data, status, headers, config) {
          console.log(data.reservations);
          callback(data.reservations);
        }).error(function(data, status, headers, config) {
          callback({
            success: false
          });
        });
      }
    }

    return {
      get: get
    };
  }
]);
