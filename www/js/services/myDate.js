angular.module('lukkari.services')
  .factory('MyDate', [function() {
    const DAY_IN_MILLISECONDS = 86400000;
    const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
      month: 'numeric',
      day: 'numeric',
      weekday: 'long'
    });

    const timeFormatter = new Intl.DateTimeFormat(navigator.language, {
      hour: 'numeric',
      minute: 'numeric'
    });

    // returns the monday of the week date object of the given date
    function getMonday(d) {
      d = new Date(d);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
    }

    function getLocaleDate({
      day, years, weekday
    }) {
      // options.year = years ? 'numeric' : undefined;
      // options.weekday = weekday ? 'long' : undefined;
      return dateFormatter.format(day);
    }

    function getLocaleTime({
      time
    }) {
      return timeFormatter.format(time);
    }

    function getDayFromDay({
      currentDay, offsetDays
    }) {
      // add desired amount of days to the millisecs
      const day = currentDay.getTime() + (offsetDays * DAY_IN_MILLISECONDS);
      // create Date object and set it's time to the millisecs
      let date = new Date();
      date.setTime(day);
      return date;
    }

    // returns a day that is offset from today
    function getDayFromToday(offsetDays) {
      return getDayFromDay({
        currentDay: new Date(),
        offsetDays
      });
    }

    function offsetDate({
      date, minutes, hours, seconds
    }) {
      let d = date;
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
      offsetDate: offsetDate,
      getLocaleTime: getLocaleTime
    };
  }]);
