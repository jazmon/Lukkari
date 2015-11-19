var lukkariServices = angular.module('lukkari.services', ['ngCookies', 'ngIcal']);

lukkariServices.factory('LocalStorage', function () {
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
});


lukkariServices.factory('MyDate', function () {
    var DAY_IN_MILLISECONDS = 86400000;

    // returns the monday of the week date object of the given date
    function getMonday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
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
});

lukkariServices.factory('Lessons', ['$http',
   function ($http) {
        var lessons = [];
        var savedGroupName = '';

        function get(groupName, callback) {
            if (savedGroupName === groupName) {
                callback(lessons);
            } else {
                savedGroupName = groupName;
                var data = {
                    studentGroup: [groupName.toUpperCase()]
                }
                var apiKey = 'Wu47zzKEPa7agvin47f5';
                var url = 'https://opendata.tamk.fi/r1/reservation/search' + '?apiKey=' + apiKey;
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

        // private get method that just saves lessons
        // change group name method that changes group anme and uses private get method
        function changeGroup(groupName) {
            //savedGroupName = groupName;
            get();
        }
        // get week method that returns one week's lessons using startDate and week offset
        function getWeek() {

        }
        // get day method that returns one day's lessons using date
        function getDay() {

        }

        //get day to day method that returns all appointments from day a to day b







        return {
            get: get
        }
   }
]);

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

lukkariServices.factory('Timetables', ['$http', 'ical', '$cookies', 'ApiEndpoint', 'MyDate',
function ($http, ical, $cookies, ApiEndpoint, MyDate) {
        var appointments = [];

        // Generates perfect ical, BUT at least android doesn't support adding a calendar
        // so it's unused.
        function toICAL() {
            var vCal = new ical.Component(['vcalendar', [], []]);
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
                url: ApiEndpoint.url + '/paivitaKori.php?toiminto=addGroup&code=' + groupName.toUpperCase(),
                withCredentials: true
            }).then(function (response) {
                // after we get response do new query that gets the ical 
                $http({
                    method: 'GET',
                    url: ApiEndpoint.url + '/icalcreator.php?startDate=' +
                        MyDate.formatDay(startDate, true) + '&endDate=' + MyDate.formatDay(endDate, true)
                }).then(function (response) {
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
            appointment.courseNumber = (event.summary.slice(appointment.summary.length));
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
        }
}]);