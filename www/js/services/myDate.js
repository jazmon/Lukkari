angular.module('lukkari.services')
  .factory('MyDate', [function() {
    const DAY_IN_MILLISECONDS = 86400000;

    // returns the monday of the week date object of the given date
    function getMonday(d) {
      d = new Date(d);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
    }

    function getLocaleDate({
      day, years
    }) {
      const options = {
        //weekday: 'long',
        month: 'numeric',
        day: 'numeric'
      };
      if (typeof years === 'boolean' && years) {
        options.year = 'numeric';
      }
      return new Intl.DateTimeFormat('fi-FI', options).format(day);
    }

    function getDayFromDay({
      currentDay, offsetDays
    }) {
      let day = currentDay.getTime();
      // add desired amount of days to the millisecs
      day += offsetDays * DAY_IN_MILLISECONDS;
      // create Date object and set it's time to the millisecs
      let date = new Date();
      date.setTime(day);
      return date;
    }

    // returns a day that is offset from today
    function getDayFromToday(offsetDays) {
      // today in millisecs since the beginning of time (UNIX time)
      let day = Date.now();
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
