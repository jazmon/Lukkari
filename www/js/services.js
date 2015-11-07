var lukkariServices = angular.module('lukkari.services', ['ngCookies', 'ngIcal']);

lukkariServices.factory('LocalStorage', function() {
    function get(name){
        return window.localStorage.getItem(name);
    }
    
    function set(name, value){
        return window.localStorage.setItem(name, value);
    }
    
    return{
        get: get,
        set: set
    }; 
});

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
    
        function get(groupName, dayCount, callback) {
                appointments = [];
                // remove phpsessid cookie, because the server
                // piles the groups into a "shopping basket"
                $cookies.remove('PHPSESSID');
                $http({
                    method: 'GET',
                    url: ApiEndpoint.url + '/paivitaKori.php?toiminto=addGroup&code=' + groupName.toUpperCase(),
                    withCredentials: true
                }).then(function (response) {
                    $http({
                        method: 'GET',
                        url: ApiEndpoint.url + '/icalcreator.php?startDate=' +
                            getDay() + '&endDate=' + getDay(dayCount)
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
                            appointment.summary = vEvents[i].getFirstPropertyValue('summary');
                            appointment.location = vEvents[i].getFirstPropertyValue('location');
                            appointment.description = vEvents[i].getFirstPropertyValue('description');
                            appointment.id = i;
                            var date = vEvents[i].getFirstPropertyValue('dtstart');
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