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
    // return: date string
    // 11.02.2040
    function formatDay(day) {
        var dayString = '';
        dayString += day.getDate();
        dayString += '.';
        dayString += (day.getMonth() + 1);
        dayString += '.';
        dayString += day.getFullYear();
        return dayString;
    }

    // returns a day that is offset from today
    function getDayFromToday(offsetDays) {
        // today in millisecs since the beginning of time (UNIX time)
        var day = Date.now();
        // add desired amount of days to the millisecs
        day += offsetDays * DAY_IN_MILLISECONDS;
        // create Date object and set it's time to the millisecs
        var date = new Date();
        date.setTime(day);
        return date;
    }

    return {
        getMonday: getMonday,
        formatDay: formatDay,
        getDayFromToday: getDayFromToday
    };
});

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
                        MyDate.formatDay(startDate) + '&endDate=' + MyDate.formatDay(endDate)
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

        function getWeek(groupName, callback) {
            var monday = MyDate.getMonday(new Date());
            var sunday = MyDate.getDayFromToday(6);
            makeRequest(groupName, monday, sunday, callback);
        }

        function getDay(groupName, dayOffset, callback) {
            var day = MyDate.getDayFromToday(dayOffset);
            makeRequest(groupName, day, day, callback);

        }

        // returns appointment with properties
        function parseEvent(vEvent, index) {
            var appointment = {};
            // try to parse the ical into logical components...
            // ical recieved is not standardized, so try catch is used to avoid errors when splitting with regex
            appointment.summary = vEvent.getFirstPropertyValue('summary').split(/[0-9]+/)[0];
            appointment.courseNumber = vEvent.getFirstPropertyValue('summary')
                .slice(appointment.summary.length);
            appointment.summary = appointment.summary.split(/[0-9]+/)[0];
            appointment.location = vEvent.getFirstPropertyValue('location').split(' - ')[0];
            try {
                appointment.locationInfo = (vEvent.getFirstPropertyValue('location')
                    .slice(appointment.location.length + 2)).split(', ')[0];
                appointment.locationInfo2 = (vEvent.getFirstPropertyValue('location')
                    .slice(appointment.location.length + 2)).split(', ')[1];
            } catch (e) {
                appointment.locationInfo = vEvent.getFirstPropertyValue('location');
            }
            try {
                appointment.teacher = (vEvent.getFirstPropertyValue('description')
                    .split(/Henkilö\(t\): /)[1]).split(/Ryhmä\(t\): /)[0];
            } catch (e) {
                appointment.teacher = vEvent.getFirstPropertyValue('description');
            }

            try {
                appointment.groups = (vEvent.getFirstPropertyValue('description')
                    .slice((vEvent.getFirstPropertyValue('description')
                        .split(/Ryhmä\(t\): /)[0]).length)).split(/Ryhmä\(t\): /)[1];
            } catch (e) {
                appointment.groups = vEvents.getFirstPropertyValue('description');
            }
            appointment.id = index;
            var date = vEvent.getFirstPropertyValue('dtstart');
            appointment.date = date.day + '.' + date.month;
            appointment.start = date.hour + ':' + date.minute;
            date = vEvent.getFirstPropertyValue('dtend');
            appointment.end = date.hour + ':' + date.minute;
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

        // returns an appointment with id
        function getAppointment(id) {
            return appointments[id];
        }

        return {
            getWeek: getWeek,
            getAppointment: getAppointment,
            getDay: getDay
        }
}]);