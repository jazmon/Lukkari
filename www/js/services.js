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

lukkariServices.factory('Timetables', ['$http', 'ical', '$cookies', 'ApiEndpoint',
function ($http, ical, $cookies, ApiEndpoint) {
        var DAY_IN_MILLISECONDS = 86400000;
        var appointments = [];

        function formatDay(day) {
            var dayString = '';
            dayString += day.getDate();
            dayString += '.';
            dayString += (day.getMonth() + 1);
            dayString += '.';
            dayString += day.getFullYear();

            console.log('day: ' + dayString);
            return dayString;
        }

        function getDay(daysToAdd) {
            var today = Date.now();
            if (daysToAdd !== undefined && daysToAdd !== null) {
                today += (daysToAdd * DAY_IN_MILLISECONDS);
            }
            var day = new Date();
            day.setTime(today);
            var todayString = formatDay(day);
            return todayString;
        }

        function get(groupName, dayOffset, dayCount, callback) {
            appointments = [];
            // remove phpsessid cookie, because the server
            // piles the groups into a 'shopping basket'
            $cookies.remove('PHPSESSID');
            $http({
                method: 'GET',
                url: ApiEndpoint.url + '/paivitaKori.php?toiminto=addGroup&code=' + groupName.toUpperCase(),
                withCredentials: true
            }).then(function (response) {
                $http({
                    method: 'GET',
                    url: ApiEndpoint.url + '/icalcreator.php?startDate=' +
                        getDay(dayOffset) + '&endDate=' + getDay(dayOffset + dayCount)
                }).then(function (response) {
                    // parse ical to vCal format
                    var vCal = ical.parse(response.data);
                    // extract the vcal (needed for this to work, lol)
                    var comp = new ical.Component(vCal);
                    // get all vevents
                    var vEvents = comp.getAllSubcomponents();
                    // loop for each event
                    for (var i = 0; i < vEvents.length; i++) {
                        var appointment = {};
                        // try to parse the ical into logical components...
                        // ical recieved is not standardized, so try catch is used to avoid errors when splitting with regex
                        appointment.summary = vEvents[i].getFirstPropertyValue('summary').split(/[0-9]+/)[0];
                        appointment.courseNumber = vEvents[i].getFirstPropertyValue('summary')
                            .slice(appointment.summary.length);
                        appointment.summary = appointment.summary.split(/[0-9]+/)[0];
                        appointment.location = vEvents[i].getFirstPropertyValue('location').split(' - ')[0];
                        try {
                            appointment.locationInfo = (vEvents[i].getFirstPropertyValue('location')
                                .slice(appointment.location.length + 2)).split(', ')[0];
                            appointment.locationInfo2 = (vEvents[i].getFirstPropertyValue('location')
                                .slice(appointment.location.length + 2)).split(', ')[1];
                        } catch (e) {
                            appointment.locationInfo = vEvents[i].getFirstPropertyValue('location');
                        }
                        try {
                            appointment.teacher = (vEvents[i].getFirstPropertyValue('description')
                                .split(/Henkilö\(t\): /)[1]).split(/Ryhmä\(t\): /)[0];
                        } catch (e) {
                            appointment.teacher = vEvents[i].getFirstPropertyValue('description');
                        }

                        try {
                            appointment.groups = (vEvents[i].getFirstPropertyValue('description')
                                .slice((vEvents[i].getFirstPropertyValue('description')
                                    .split(/Ryhmä\(t\): /)[0]).length)).split(/Ryhmä\(t\): /)[1];
                        } catch (e) {
                            appointment.groups = vEvents.getFirstPropertyValue('description');
                        }
                        appointment.id = i;
                        var date = vEvents[i].getFirstPropertyValue('dtstart');
                        appointment.date = date.day + '.' + date.month;
                        appointment.start = date.hour + ':' + date.minute;
                        date = vEvents[i].getFirstPropertyValue('dtend');
                        appointment.end = date.hour + ':' + date.minute;
                        appointments.push(appointment);
                    }

                    callback(appointments);
                });
            });
        }

        function getAppointment(id) {
            return appointments[id];
        }

        return {
            get: get,
            getAppointment: getAppointment
        }
}]);