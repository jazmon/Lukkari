var lukkariApp = angular.module('lukkari', ['ionic', 'lukkari.controllers', 'lukkari.services', 'ionic-datepicker']);

lukkariApp.run(function ($ionicPlatform) {
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
});

// http://blog.ionic.io/handling-cors-issues-in-ionic/
lukkariApp.constant('ApiEndpoint', {
    url: 'https://lukkarit.tamk.fi'
});

// menuContent-view is presented on the main view.
lukkariApp.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'LukkariCtrl'
        })
        .state('app.search', {
            url: '/search',
            views: {
                'menuContent': {
                    templateUrl: 'templates/search.html',
                    controller: 'SearchCtrl'
                }
            }
        })
        .state('app.settings', {
            url: '/settings',
            views: {
                'menuContent': {
                    templateUrl: 'templates/settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state('app.todayAppointment', {
            url: '/today/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/appointment.html',
                    controller: 'AppointmentCtrl'
                }
            }
        })
        .state('app.today', {
            url: '/today',
            views: {
                'menuContent': {
                    templateUrl: 'templates/today.html',
                    controller: 'TodayCtrl'
                }
            }
        })
        .state('app.appointment', {
            url: '/week/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/appointment.html',
                    controller: 'AppointmentCtrl'
                }
            }
        })
        .state('app.week', {
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
});
var lukkariControllers = angular.module('lukkari.controllers', ['ngCordova']);

// insert needed sidemenu stuff here
lukkariControllers.controller('LukkariCtrl', function ($scope) {});

// controller for today view
lukkariControllers.controller('TodayCtrl', ['$scope', 'Timetables', '$ionicLoading', 'LocalStorage', '$ionicModal', 'MyDate',
function ($scope, Timetables, $ionicLoading, LocalStorage, $ionicModal, MyDate) {
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
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.getDay($scope.groupInfo.group, $scope.dayOffset, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        };

        $scope.appointments = [];
        if ($scope.groupInfo.group !== undefined) {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.getDay($scope.groupInfo.group, $scope.dayOffset, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        }

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
            $ionicLoading.show({
                template: 'Loading...'
            });
            $scope.appointments = [];
            Timetables.getDay($scope.groupInfo.group, $scope.dayOffset, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        };
}]);

// controller for single appointment view
lukkariControllers.controller('AppointmentCtrl', ['$scope', 'Timetables', '$ionicLoading', '$stateParams',
function ($scope, Timetables, $ionicLoading, $stateParams) {
        $scope.appointment = Timetables.getAppointment($stateParams.id);
}]);

// controller for weekly view
lukkariControllers.controller('WeekCtrl', ['$scope', 'Timetables', '$ionicLoading', '$ionicModal', 'LocalStorage', 'MyDate', 'Lessons',
function ($scope, Timetables, $ionicLoading, $ionicModal, LocalStorage, MyDate, Lessons) {
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
            $ionicLoading.show({
                template: 'Loading...'
            });
            // get all the appointments
            Timetables.getWeek($scope.groupInfo.group, $scope.weekOffset, function (result) {
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
                        if (appointment.startDate.toDateString() === day.date.toDateString()) {
                            day.appointments.push(appointment);
                        }
                    }
                    // add the day into the array
                    $scope.days.push(day);
                }
                // hide the loading after done
                $ionicLoading.hide();
            });
        }

        Lessons.get($scope.groupInfo.group, function (lessons) {
            if (lessons.hasOwnProperty(success) && lessons.success !== false) {
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

lukkariControllers.controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform', '$cookies', '$timeout', '$cordovaCalendar', 'Timetables',
function ($scope, LocalStorage, $cordovaToast, $ionicPlatform, $cookies, $timeout, $cordovaCalendar, Timetables) {
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
            if (typeof (val) === 'undefined') {
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
            callback: function (val) { //Mandatory
                datePickerCallback(val);
            },
            dateFormat: 'dd-MM-yyyy', //Optional
            closeOnSelect: false, //Optional
        };

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
                    $cordovaToast.show('Group successfully changed!',
                            toastOptions.duration,
                            toastOptions.position)
                        .then(function (success) {
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
                console.log('Added ' + element.summary + ', ' +
                    element.startDate.toLocaleDateString());
            }

            // loop all weeks
            for (var i = 1; i < $scope.reminder.weeks; i++) {
                // get next weeks appointments
                Timetables.getWeek($scope.groupInfo.group, i, getAppointments(result));
            }

            if (success) {
                $cordovaToast.show('Calendar events successfully added!',
                    toastOptions.duration,
                    toastOptions.position);
            } else {
                $cordovaToast.show('Failed to add calendar events!',
                    toastOptions.duration,
                    toastOptions.position);
            }

        };
}]);

// TODO
lukkariControllers.controller('SearchCtrl', ['$scope', 'LocalStorage',
function ($scope, LocalStorage) {

}]);
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
            diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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
                };
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

        return {
            get: get
        };
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
        };
}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzLmpzIiwic2VydmljZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGx1a2thcmlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnbHVra2FyaScsIFsnaW9uaWMnLCAnbHVra2FyaS5jb250cm9sbGVycycsICdsdWtrYXJpLnNlcnZpY2VzJywgJ2lvbmljLWRhdGVwaWNrZXInXSk7XHJcblxyXG5sdWtrYXJpQXBwLnJ1bihmdW5jdGlvbiAoJGlvbmljUGxhdGZvcm0pIHtcclxuICAgICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXHJcbiAgICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxyXG4gICAgICAgIGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XHJcbiAgICAgICAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XHJcbiAgICAgICAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcclxuICAgICAgICAgICAgLy8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxyXG4gICAgICAgICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuLy8gaHR0cDovL2Jsb2cuaW9uaWMuaW8vaGFuZGxpbmctY29ycy1pc3N1ZXMtaW4taW9uaWMvXHJcbmx1a2thcmlBcHAuY29uc3RhbnQoJ0FwaUVuZHBvaW50Jywge1xyXG4gICAgdXJsOiAnaHR0cHM6Ly9sdWtrYXJpdC50YW1rLmZpJ1xyXG59KTtcclxuXHJcbi8vIG1lbnVDb250ZW50LXZpZXcgaXMgcHJlc2VudGVkIG9uIHRoZSBtYWluIHZpZXcuXHJcbmx1a2thcmlBcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcbiAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgIC5zdGF0ZSgnYXBwJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBwJyxcclxuICAgICAgICAgICAgYWJzdHJhY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21lbnUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMdWtrYXJpQ3RybCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnYXBwLnNlYXJjaCcsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3NlYXJjaCcsXHJcbiAgICAgICAgICAgIHZpZXdzOiB7XHJcbiAgICAgICAgICAgICAgICAnbWVudUNvbnRlbnQnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvc2VhcmNoLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTZWFyY2hDdHJsJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2FwcC5zZXR0aW5ncycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcclxuICAgICAgICAgICAgdmlld3M6IHtcclxuICAgICAgICAgICAgICAgICdtZW51Q29udGVudCc6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9zZXR0aW5ncy5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2V0dGluZ3NDdHJsJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2FwcC50b2RheUFwcG9pbnRtZW50Jywge1xyXG4gICAgICAgICAgICB1cmw6ICcvdG9kYXkvOmlkJyxcclxuICAgICAgICAgICAgdmlld3M6IHtcclxuICAgICAgICAgICAgICAgICdtZW51Q29udGVudCc6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hcHBvaW50bWVudC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXBwb2ludG1lbnRDdHJsJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2FwcC50b2RheScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3RvZGF5JyxcclxuICAgICAgICAgICAgdmlld3M6IHtcclxuICAgICAgICAgICAgICAgICdtZW51Q29udGVudCc6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b2RheS5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVG9kYXlDdHJsJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2FwcC5hcHBvaW50bWVudCcsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3dlZWsvOmlkJyxcclxuICAgICAgICAgICAgdmlld3M6IHtcclxuICAgICAgICAgICAgICAgICdtZW51Q29udGVudCc6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hcHBvaW50bWVudC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXBwb2ludG1lbnRDdHJsJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2FwcC53ZWVrJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvd2VlaycsXHJcbiAgICAgICAgICAgIHZpZXdzOiB7XHJcbiAgICAgICAgICAgICAgICAnbWVudUNvbnRlbnQnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvd2Vlay5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnV2Vla0N0cmwnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvYXBwL3RvZGF5Jyk7XHJcbn0pOyIsInZhciBsdWtrYXJpQ29udHJvbGxlcnMgPSBhbmd1bGFyLm1vZHVsZSgnbHVra2FyaS5jb250cm9sbGVycycsIFsnbmdDb3Jkb3ZhJ10pO1xyXG5cclxuLy8gaW5zZXJ0IG5lZWRlZCBzaWRlbWVudSBzdHVmZiBoZXJlXHJcbmx1a2thcmlDb250cm9sbGVycy5jb250cm9sbGVyKCdMdWtrYXJpQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHt9KTtcclxuXHJcbi8vIGNvbnRyb2xsZXIgZm9yIHRvZGF5IHZpZXdcclxubHVra2FyaUNvbnRyb2xsZXJzLmNvbnRyb2xsZXIoJ1RvZGF5Q3RybCcsIFsnJHNjb3BlJywgJ1RpbWV0YWJsZXMnLCAnJGlvbmljTG9hZGluZycsICdMb2NhbFN0b3JhZ2UnLCAnJGlvbmljTW9kYWwnLCAnTXlEYXRlJyxcclxuZnVuY3Rpb24gKCRzY29wZSwgVGltZXRhYmxlcywgJGlvbmljTG9hZGluZywgTG9jYWxTdG9yYWdlLCAkaW9uaWNNb2RhbCwgTXlEYXRlKSB7XHJcbiAgICAgICAgJHNjb3BlLmdyb3VwSW5mbyA9IHt9O1xyXG4gICAgICAgICRzY29wZS5ncm91cEluZm8uZ3JvdXAgPSBMb2NhbFN0b3JhZ2UuZ2V0KCdncm91cE5hbWUnKTtcclxuICAgICAgICAkc2NvcGUuZGF5T2Zmc2V0ID0gMDtcclxuICAgICAgICAkc2NvcGUuY3VycmVudERheSA9ICdUb2RheSc7XHJcblxyXG4gICAgICAgIC8vIFNob3cgbmV3IGdyb3VwIG1vZGFsIHdoZW4gbm8gZ3JvdXAgaXMgc2V0XHJcbiAgICAgICAgJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCd0ZW1wbGF0ZXMvbmV3Z3JvdXAuaHRtbCcsIHtcclxuICAgICAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5tb2RhbCA9IG1vZGFsO1xyXG4gICAgICAgICAgICBpZiAoISRzY29wZS5ncm91cEluZm8uZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIC8vIG9wZW4gbW9kYWwgdG8gc2V0IGdyb3VwIG5hbWVcclxuICAgICAgICAgICAgICAgICRzY29wZS5tb2RhbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNsb3NlR3JvdXBOYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUubW9kYWwuaGlkZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIHNldHMgdGhlIGdyb3VwIFxyXG4gICAgICAgICRzY29wZS5zZXRHcm91cCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgTG9jYWxTdG9yYWdlLnNldCgnZ3JvdXBOYW1lJywgJHNjb3BlLmdyb3VwSW5mby5ncm91cCk7XHJcbiAgICAgICAgICAgICRzY29wZS5tb2RhbC5oaWRlKCk7XHJcbiAgICAgICAgICAgICRpb25pY0xvYWRpbmcuc2hvdyh7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ0xvYWRpbmcuLi4nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBUaW1ldGFibGVzLmdldERheSgkc2NvcGUuZ3JvdXBJbmZvLmdyb3VwLCAkc2NvcGUuZGF5T2Zmc2V0LCBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYXBwb2ludG1lbnRzID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5hcHBvaW50bWVudHMgPSBbXTtcclxuICAgICAgICBpZiAoJHNjb3BlLmdyb3VwSW5mby5ncm91cCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICRpb25pY0xvYWRpbmcuc2hvdyh7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ0xvYWRpbmcuLi4nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBUaW1ldGFibGVzLmdldERheSgkc2NvcGUuZ3JvdXBJbmZvLmdyb3VwLCAkc2NvcGUuZGF5T2Zmc2V0LCBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYXBwb2ludG1lbnRzID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTW92ZXMgYSBkYXkgZm9yd2FyZHMvYmFja3dhcmRzXHJcbiAgICAgICAgJHNjb3BlLm1vdmVEYXkgPSBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIC8vIGNoYW5nZSB0aGUgb2Zmc2V0IGZyb20gY3VycmVudCBkYXlcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXlPZmZzZXQgLT0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXlPZmZzZXQgKz0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdQYXJhbWV0ZXIgb3V0IG9mIHJhbmdlISBQbGVhc2UgdXNlIDEgb3IgLTEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IE15RGF0ZS5nZXREYXlGcm9tVG9kYXkoJHNjb3BlLmRheU9mZnNldCk7XHJcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50RGF5ID0gTXlEYXRlLmdldExvY2FsZURhdGUoZGF0ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAkaW9uaWNMb2FkaW5nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICdMb2FkaW5nLi4uJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjb3BlLmFwcG9pbnRtZW50cyA9IFtdO1xyXG4gICAgICAgICAgICBUaW1ldGFibGVzLmdldERheSgkc2NvcGUuZ3JvdXBJbmZvLmdyb3VwLCAkc2NvcGUuZGF5T2Zmc2V0LCBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYXBwb2ludG1lbnRzID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbn1dKTtcclxuXHJcbi8vIGNvbnRyb2xsZXIgZm9yIHNpbmdsZSBhcHBvaW50bWVudCB2aWV3XHJcbmx1a2thcmlDb250cm9sbGVycy5jb250cm9sbGVyKCdBcHBvaW50bWVudEN0cmwnLCBbJyRzY29wZScsICdUaW1ldGFibGVzJywgJyRpb25pY0xvYWRpbmcnLCAnJHN0YXRlUGFyYW1zJyxcclxuZnVuY3Rpb24gKCRzY29wZSwgVGltZXRhYmxlcywgJGlvbmljTG9hZGluZywgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICAgICAgJHNjb3BlLmFwcG9pbnRtZW50ID0gVGltZXRhYmxlcy5nZXRBcHBvaW50bWVudCgkc3RhdGVQYXJhbXMuaWQpO1xyXG59XSk7XHJcblxyXG4vLyBjb250cm9sbGVyIGZvciB3ZWVrbHkgdmlld1xyXG5sdWtrYXJpQ29udHJvbGxlcnMuY29udHJvbGxlcignV2Vla0N0cmwnLCBbJyRzY29wZScsICdUaW1ldGFibGVzJywgJyRpb25pY0xvYWRpbmcnLCAnJGlvbmljTW9kYWwnLCAnTG9jYWxTdG9yYWdlJywgJ015RGF0ZScsICdMZXNzb25zJyxcclxuZnVuY3Rpb24gKCRzY29wZSwgVGltZXRhYmxlcywgJGlvbmljTG9hZGluZywgJGlvbmljTW9kYWwsIExvY2FsU3RvcmFnZSwgTXlEYXRlLCBMZXNzb25zKSB7XHJcbiAgICAgICAgJHNjb3BlLmdyb3VwSW5mbyA9IHt9O1xyXG4gICAgICAgICRzY29wZS53ZWVrID0ge307XHJcbiAgICAgICAgJHNjb3BlLndlZWtPZmZzZXQgPSAwO1xyXG4gICAgICAgICRzY29wZS5ncm91cEluZm8uZ3JvdXAgPSBMb2NhbFN0b3JhZ2UuZ2V0KCdncm91cE5hbWUnKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIG1vZGFsIGZvciBuZXcgZ3JvdXAgaWYgbm8gZ3JvdXAgbmFtZSBpcyBzZXRcclxuICAgICAgICBpZiAoISRzY29wZS5ncm91cEluZm8uZ3JvdXApIHtcclxuICAgICAgICAgICAgJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCd0ZW1wbGF0ZXMvbmV3Z3JvdXAuaHRtbCcsIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5tb2RhbCA9IG1vZGFsO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG9wZW4gbW9kYWwgdG8gc2V0IGdyb3VwIG5hbWVcclxuICAgICAgICAgICAgICAgICRzY29wZS5tb2RhbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2xvc2VzIHRoZSBncm91cCBuYW1lIGRpYWxvZ1xyXG4gICAgICAgICRzY29wZS5jbG9zZUdyb3VwTmFtZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLm1vZGFsLmhpZGUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyByZXR1cm5zIGFsbCBvZiB0aGUgYXBwb2ludG1lbnRzXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXBwb2ludG1lbnRzKCkge1xyXG4gICAgICAgICAgICAvLyBzaG93IHRoZSBsb2FkaW5nIHdpbmRvd1xyXG4gICAgICAgICAgICAkaW9uaWNMb2FkaW5nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICdMb2FkaW5nLi4uJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gZ2V0IGFsbCB0aGUgYXBwb2ludG1lbnRzXHJcbiAgICAgICAgICAgIFRpbWV0YWJsZXMuZ2V0V2Vlaygkc2NvcGUuZ3JvdXBJbmZvLmdyb3VwLCAkc2NvcGUud2Vla09mZnNldCwgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFwcG9pbnRtZW50cyA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXlzID0gW107XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnREYXRlID0gTXlEYXRlLmdldE1vbmRheShhcHBvaW50bWVudHNbMF0uc3RhcnREYXRlKTtcclxuICAgICAgICAgICAgICAgIC8vIGxvb3Agd2hvbGUgd2Vla1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF5ID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IG1vbi1zdW4gZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5LmRhdGUgPSBNeURhdGUuZ2V0RGF5RnJvbURheShzdGFydERhdGUsIGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRheS5hcHBvaW50bWVudHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFwcG9pbnRtZW50cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXBwb2ludG1lbnQgPSBhcHBvaW50bWVudHNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGlzIHRoZSBzYW1lIGRheSBwdXNoIGludG8gdGhlIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHBvaW50bWVudC5zdGFydERhdGUudG9EYXRlU3RyaW5nKCkgPT09IGRheS5kYXRlLnRvRGF0ZVN0cmluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXkuYXBwb2ludG1lbnRzLnB1c2goYXBwb2ludG1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgZGF5IGludG8gdGhlIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRheXMucHVzaChkYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gaGlkZSB0aGUgbG9hZGluZyBhZnRlciBkb25lXHJcbiAgICAgICAgICAgICAgICAkaW9uaWNMb2FkaW5nLmhpZGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBMZXNzb25zLmdldCgkc2NvcGUuZ3JvdXBJbmZvLmdyb3VwLCBmdW5jdGlvbiAobGVzc29ucykge1xyXG4gICAgICAgICAgICBpZiAobGVzc29ucy5oYXNPd25Qcm9wZXJ0eShzdWNjZXNzKSAmJiBsZXNzb25zLnN1Y2Nlc3MgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRkFJTEVEJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxlc3NvbnMgPSBsZXNzb25zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHNldHMgdGhlIGdyb3VwIG5hbWVcclxuICAgICAgICAkc2NvcGUuc2V0R3JvdXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIExvY2FsU3RvcmFnZS5zZXQoJ2dyb3VwTmFtZScsICRzY29wZS5ncm91cEluZm8uZ3JvdXApO1xyXG4gICAgICAgICAgICAkc2NvcGUubW9kYWwuaGlkZSgpO1xyXG4gICAgICAgICAgICBnZXRBcHBvaW50bWVudHMoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuYXBwb2ludG1lbnRzID0gW107XHJcbiAgICAgICAgaWYgKCRzY29wZS5ncm91cEluZm8uZ3JvdXAgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBnZXRBcHBvaW50bWVudHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1vdmVzIGEgd2VlayBmb3J3YXJkcy9iYWNrd2FyZHNcclxuICAgICAgICAkc2NvcGUubW92ZVdlZWsgPSBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICRzY29wZS53ZWVrT2Zmc2V0ICs9IGRpcmVjdGlvbjtcclxuICAgICAgICAgICAgZ2V0QXBwb2ludG1lbnRzKCk7XHJcbiAgICAgICAgfTtcclxufV0pO1xyXG5cclxubHVra2FyaUNvbnRyb2xsZXJzLmNvbnRyb2xsZXIoJ1NldHRpbmdzQ3RybCcsIFsnJHNjb3BlJywgJ0xvY2FsU3RvcmFnZScsICckY29yZG92YVRvYXN0JywgJyRpb25pY1BsYXRmb3JtJywgJyRjb29raWVzJywgJyR0aW1lb3V0JywgJyRjb3Jkb3ZhQ2FsZW5kYXInLCAnVGltZXRhYmxlcycsXHJcbmZ1bmN0aW9uICgkc2NvcGUsIExvY2FsU3RvcmFnZSwgJGNvcmRvdmFUb2FzdCwgJGlvbmljUGxhdGZvcm0sICRjb29raWVzLCAkdGltZW91dCwgJGNvcmRvdmFDYWxlbmRhciwgVGltZXRhYmxlcykge1xyXG4gICAgICAgICRzY29wZS5ncm91cEluZm8gPSB7fTtcclxuICAgICAgICAkc2NvcGUucmVtaW5kZXIgPSB7fTtcclxuICAgICAgICAkc2NvcGUucmVtaW5kZXIuc3RhcnREYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICRzY29wZS5yZW1pbmRlci53ZWVrcyA9IDE7XHJcblxyXG4gICAgICAgIHZhciB0b2FzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAnbG9uZycsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnY2VudGVyJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJDYWxsYmFjayh2YWwpIHtcclxuICAgICAgICAgICAgLy8gZG8gc29tZXRoaW5nIFxyXG4gICAgICAgICAgICBpZiAodHlwZW9mICh2YWwpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGRhdGUgc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZWxlY3RlZCBkYXRlIGlzIDogJywgdmFsKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5yZW1pbmRlci5zdGFydERheSA9IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3JhamVzaHdhcnBhdGxvbGxhL2lvbmljLWRhdGVwaWNrZXJcclxuICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck9iamVjdCA9IHtcclxuICAgICAgICAgICAgdGl0bGVMYWJlbDogJ1NlbGVjdCBEYXRlJywgLy9PcHRpb25hbFxyXG4gICAgICAgICAgICB0b2RheUxhYmVsOiAnVG9kYXknLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIGNsb3NlTGFiZWw6ICdDbG9zZScsIC8vT3B0aW9uYWxcclxuICAgICAgICAgICAgc2V0TGFiZWw6ICdTZXQnLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIHNldEJ1dHRvblR5cGU6ICdidXR0b24tcG9zaXRpdmUnLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIHRvZGF5QnV0dG9uVHlwZTogJ2J1dHRvbi1zdGFibGUnLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uVHlwZTogJ2J1dHRvbi1zdGFibGUnLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIGlucHV0RGF0ZTogbmV3IERhdGUoKSwgLy9PcHRpb25hbFxyXG4gICAgICAgICAgICBtb25kYXlGaXJzdDogdHJ1ZSwgLy9PcHRpb25hbFxyXG4gICAgICAgICAgICAvL2Rpc2FibGVkRGF0ZXM6IGRpc2FibGVkRGF0ZXMsIC8vT3B0aW9uYWxcclxuICAgICAgICAgICAgLy93ZWVrRGF5c0xpc3Q6IHdlZWtEYXlzTGlzdCwgLy9PcHRpb25hbFxyXG4gICAgICAgICAgICAvL21vbnRoTGlzdDogbW9udGhMaXN0LCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVHlwZTogJ3BvcHVwJywgLy9PcHRpb25hbFxyXG4gICAgICAgICAgICBzaG93VG9kYXlCdXR0b246ICd0cnVlJywgLy9PcHRpb25hbFxyXG4gICAgICAgICAgICBtb2RhbEhlYWRlckNvbG9yOiAnYmFyLXN0YWJsZScsIC8vT3B0aW9uYWxcclxuICAgICAgICAgICAgbW9kYWxGb290ZXJDb2xvcjogJ2Jhci1zdGFibGUnLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIGZyb206IG5ldyBEYXRlKCksIC8vT3B0aW9uYWxcclxuICAgICAgICAgICAgLy90bzogbmV3IERhdGUoMjAxOCwgOCwgMjUpLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAodmFsKSB7IC8vTWFuZGF0b3J5XHJcbiAgICAgICAgICAgICAgICBkYXRlUGlja2VyQ2FsbGJhY2sodmFsKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogJ2RkLU1NLXl5eXknLCAvL09wdGlvbmFsXHJcbiAgICAgICAgICAgIGNsb3NlT25TZWxlY3Q6IGZhbHNlLCAvL09wdGlvbmFsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnJlbWluZGVyLnRpbWUgPSAnbnVsbCc7XHJcbiAgICAgICAgJHNjb3BlLmdyb3VwSW5mby5ncm91cCA9IExvY2FsU3RvcmFnZS5nZXQoJ2dyb3VwTmFtZScpO1xyXG4gICAgICAgIGlmICghJHNjb3BlLmdyb3VwSW5mby5ncm91cCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZ3JvdXBJbmZvLmdyb3VwID0gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuY2hhbmdlR3JvdXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIExvY2FsU3RvcmFnZS5zZXQoJ2dyb3VwTmFtZScsICRzY29wZS5ncm91cEluZm8uZ3JvdXApO1xyXG4gICAgICAgICAgICAvLyBzaG93IHRvYXN0IHRoYXQgY2hhbmdlIHdhcyBzdWNjZXNzZnVsXHJcbiAgICAgICAgICAgICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFUb2FzdC5zaG93KCdHcm91cCBzdWNjZXNzZnVsbHkgY2hhbmdlZCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9hc3RPcHRpb25zLmR1cmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9hc3RPcHRpb25zLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvb2tpZXMucmVtb3ZlKCdQSFBTRVNTSUQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgdG8gdG9kYXkgdmlldyBhZnRlciAyIHNlY29uZHNcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJyMvYXBwL3RvZGF5JztcclxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmFkZFRvQ2FsZW5kYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBhcHBvaW50bWVudHMgPSBbXTtcclxuICAgICAgICAgICAgdmFyIGNhbE9wdGlvbnMgPSB7fTtcclxuICAgICAgICAgICAgLy8gd29ya3Mgb24gaU9TIG9ubHlcclxuICAgICAgICAgICAgY2FsT3B0aW9ucy5jYWxlbmRhck5hbWUgPSAnTHVra2FyaSBhcHAgY2FsZW5kYXInO1xyXG4gICAgICAgICAgICAvLyBhbmRyb2lkIGhhcyBpZCBidXQgbm8gZnVja2luZyBpZGVhIHdoYXQgaXQgZG9lcyAoMSBpcyBkZWZhdWx0KVxyXG4gICAgICAgICAgICAvLyBzbyBncmVhdCBkb2N1bWVudGF0aW9uIDUvNSBcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0VkZHlWZXJicnVnZ2VuL0NhbGVuZGFyLVBob25lR2FwLVBsdWdpblxyXG4gICAgICAgICAgICBjYWxPcHRpb25zLmNhbGVuZGFySWQgPSAxO1xyXG5cclxuICAgICAgICAgICAgLy8gZ29vZ2xlIG1heSBzZXQgc29tZSBkZWZhdWx0IHJlbWluZGVycyBkZXBlbmRpbmcgb24gc2V0dGluZ3NcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0VkZHlWZXJicnVnZ2VuL0NhbGVuZGFyLVBob25lR2FwLVBsdWdpbi9pc3N1ZXMvMjAxXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUucmVtaW5kZXIudGltZSAhPT0gJ251bGwnKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxPcHRpb25zLmZpcnN0UmVtaW5kZXJNaW51dGVzID0gJHNjb3BlLnJlbWluZGVyLnRpbWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjYWxPcHRpb25zLmZpcnN0UmVtaW5kZXJNaW51dGVzID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYWxPcHRpb25zLnNlY29uZFJlbWluZGVyTWludXRlcyA9IG51bGw7XHJcblxyXG5cclxuICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJHNjb3BlLnJlbWluZGVyLndlZWtzOiAnICsgJHNjb3BlLnJlbWluZGVyLndlZWtzKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJyRzY29wZS5yZW1pbmRlci5zdGFydERheTogJyArICRzY29wZS5yZW1pbmRlci5zdGFydERheSk7XHJcbiAgICAgICAgICAgIC8vIFRPRE8gY3JlYXRlIGEgc2VydmljZSBtZXRob2QgdGhhdCBjYW4gZ2V0IGRheXMgZnJvbSBhIGRheSB0byBhIGRheS5cclxuICAgICAgICAgICAgLy8gYW5kIHVzZSBpdCBoZXJlLlxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0QXBwb2ludG1lbnRzKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgYXBwb2ludG1lbnRzID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50cy5mb3JFYWNoKGNyZWF0ZUV2ZW50KGVsbWVudCwgaW5kZXgsIGFycmF5KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlRXZlbnQoZWxlbWVudCwgaW5kZXgsIGFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAvKiRjb3Jkb3ZhQ2FsZW5kYXIuY3JlYXRlRXZlbnRXaXRoT3B0aW9ucyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGVsZW1lbnQuc3VtbWFyeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbjogZWxlbWVudC5sb2NhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlczogJ1RlYWNoZXIocyk6ICcgKyBlbGVtZW50LnRlYWNoZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnXFxuR3JvdXAocyk6ICcgKyBlbGVtZW50Lmdyb3VwcyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcXG5Db3Vyc2U6ICcgKyBlbGVtZW50LmNvdXJzZU51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydERhdGU6IGVsZW1lbnQuc3RhcnREYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZERhdGU6IGVsZW1lbnQuZW5kRGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFJlbWluZGVyTWludXRlczogY2FsT3B0aW9ucy5maXJzdFJlbWluZGVyTWludXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRSZW1pbmRlck1pbnV0ZXM6IGNhbE9wdGlvbnMuc2Vjb25kUmVtaW5kZXJNaW51dGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyTmFtZTogY2FsT3B0aW9ucy5jYWxlbmRhck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXJJZDogY2FsT3B0aW9ucy5jYWxlbmRhcklkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2FsT3B0aW9uczogY2FsT3B0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWNjZXNzZnVsbHkgYWRkZWQgd2VlayB0byBjYWxlbmRhcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQWRkZWQgJyArIGVsZW1lbnQuc3VtbWFyeSArICcsICcgK1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3RhcnREYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gbG9vcCBhbGwgd2Vla3NcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCAkc2NvcGUucmVtaW5kZXIud2Vla3M7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gZ2V0IG5leHQgd2Vla3MgYXBwb2ludG1lbnRzXHJcbiAgICAgICAgICAgICAgICBUaW1ldGFibGVzLmdldFdlZWsoJHNjb3BlLmdyb3VwSW5mby5ncm91cCwgaSwgZ2V0QXBwb2ludG1lbnRzKHJlc3VsdCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgJGNvcmRvdmFUb2FzdC5zaG93KCdDYWxlbmRhciBldmVudHMgc3VjY2Vzc2Z1bGx5IGFkZGVkIScsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9hc3RPcHRpb25zLmR1cmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvYXN0T3B0aW9ucy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkY29yZG92YVRvYXN0LnNob3coJ0ZhaWxlZCB0byBhZGQgY2FsZW5kYXIgZXZlbnRzIScsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9hc3RPcHRpb25zLmR1cmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvYXN0T3B0aW9ucy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxufV0pO1xyXG5cclxuLy8gVE9ET1xyXG5sdWtrYXJpQ29udHJvbGxlcnMuY29udHJvbGxlcignU2VhcmNoQ3RybCcsIFsnJHNjb3BlJywgJ0xvY2FsU3RvcmFnZScsXHJcbmZ1bmN0aW9uICgkc2NvcGUsIExvY2FsU3RvcmFnZSkge1xyXG5cclxufV0pOyIsInZhciBsdWtrYXJpU2VydmljZXMgPSBhbmd1bGFyLm1vZHVsZSgnbHVra2FyaS5zZXJ2aWNlcycsIFsnbmdDb29raWVzJywgJ25nSWNhbCddKTtcclxuXHJcbmx1a2thcmlTZXJ2aWNlcy5mYWN0b3J5KCdMb2NhbFN0b3JhZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBnZXQobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0KG5hbWUsIHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShuYW1lLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXQ6IGdldCxcclxuICAgICAgICBzZXQ6IHNldFxyXG4gICAgfTtcclxufSk7XHJcblxyXG5cclxubHVra2FyaVNlcnZpY2VzLmZhY3RvcnkoJ015RGF0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBEQVlfSU5fTUlMTElTRUNPTkRTID0gODY0MDAwMDA7XHJcblxyXG4gICAgLy8gcmV0dXJucyB0aGUgbW9uZGF5IG9mIHRoZSB3ZWVrIGRhdGUgb2JqZWN0IG9mIHRoZSBnaXZlbiBkYXRlXHJcbiAgICBmdW5jdGlvbiBnZXRNb25kYXkoZCkge1xyXG4gICAgICAgIGQgPSBuZXcgRGF0ZShkKTtcclxuICAgICAgICB2YXIgZGF5ID0gZC5nZXREYXkoKSxcclxuICAgICAgICAgICAgZGlmZiA9IGQuZ2V0RGF0ZSgpIC0gZGF5ICsgKGRheSA9PT0gMCA/IC02IDogMSk7IC8vIGFkanVzdCB3aGVuIGRheSBpcyBzdW5kYXlcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZC5zZXREYXRlKGRpZmYpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmb3JtYXRzIGEgRGF0ZSBvYmplY3QgaW50byBhIHN0cmluZ1xyXG4gICAgLy8gcGFyYW1ldGVyOiBkYXRlIG9iamVjdFxyXG4gICAgLy8gcGFyYW1ldGVyMjogcmV0dXJuIHllYXJzIGJvb2xlYW5cclxuICAgIC8vIHJldHVybjogZGF0ZSBzdHJpbmdcclxuICAgIC8vIDExLjAyLjIwNDBcclxuICAgIGZ1bmN0aW9uIGZvcm1hdERheShkYXksIHllYXJzKSB7XHJcbiAgICAgICAgdmFyIGRheVN0cmluZyA9ICcnO1xyXG4gICAgICAgIGRheVN0cmluZyArPSBkYXkuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGRheVN0cmluZyArPSAnLic7XHJcbiAgICAgICAgZGF5U3RyaW5nICs9IChkYXkuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgeWVhcnMgPT09ICdib29sZWFuJyAmJiB5ZWFycykge1xyXG4gICAgICAgICAgICBkYXlTdHJpbmcgKz0gJy4nO1xyXG4gICAgICAgICAgICBkYXlTdHJpbmcgKz0gZGF5LmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXlTdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TG9jYWxlRGF0ZShkYXksIHllYXJzKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIC8vd2Vla2RheTogJ2xvbmcnLFxyXG4gICAgICAgICAgICBtb250aDogJ251bWVyaWMnLFxyXG4gICAgICAgICAgICBkYXk6ICdudW1lcmljJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHR5cGVvZiB5ZWFycyA9PT0gJ2Jvb2xlYW4nICYmIHllYXJzKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMueWVhciA9ICdudW1lcmljJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdmaS1GSScsIG9wdGlvbnMpLmZvcm1hdChkYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldERheUZyb21EYXkoY3VycmVudERheSwgb2Zmc2V0RGF5cykge1xyXG4gICAgICAgIHZhciBkYXkgPSBjdXJyZW50RGF5LmdldFRpbWUoKTtcclxuICAgICAgICAvLyBhZGQgZGVzaXJlZCBhbW91bnQgb2YgZGF5cyB0byB0aGUgbWlsbGlzZWNzXHJcbiAgICAgICAgZGF5ICs9IG9mZnNldERheXMgKiBEQVlfSU5fTUlMTElTRUNPTkRTO1xyXG4gICAgICAgIC8vIGNyZWF0ZSBEYXRlIG9iamVjdCBhbmQgc2V0IGl0J3MgdGltZSB0byB0aGUgbWlsbGlzZWNzXHJcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGRhdGUuc2V0VGltZShkYXkpO1xyXG4gICAgICAgIHJldHVybiBkYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJldHVybnMgYSBkYXkgdGhhdCBpcyBvZmZzZXQgZnJvbSB0b2RheVxyXG4gICAgZnVuY3Rpb24gZ2V0RGF5RnJvbVRvZGF5KG9mZnNldERheXMpIHtcclxuICAgICAgICAvLyB0b2RheSBpbiBtaWxsaXNlY3Mgc2luY2UgdGhlIGJlZ2lubmluZyBvZiB0aW1lIChVTklYIHRpbWUpXHJcbiAgICAgICAgdmFyIGRheSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgLy8gYWRkIGRlc2lyZWQgYW1vdW50IG9mIGRheXMgdG8gdGhlIG1pbGxpc2Vjc1xyXG4gICAgICAgIGRheSArPSBvZmZzZXREYXlzICogREFZX0lOX01JTExJU0VDT05EUztcclxuICAgICAgICAvLyBjcmVhdGUgRGF0ZSBvYmplY3QgYW5kIHNldCBpdCdzIHRpbWUgdG8gdGhlIG1pbGxpc2Vjc1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0TW9uZGF5OiBnZXRNb25kYXksXHJcbiAgICAgICAgZm9ybWF0RGF5OiBmb3JtYXREYXksXHJcbiAgICAgICAgZ2V0RGF5RnJvbVRvZGF5OiBnZXREYXlGcm9tVG9kYXksXHJcbiAgICAgICAgZ2V0TG9jYWxlRGF0ZTogZ2V0TG9jYWxlRGF0ZSxcclxuICAgICAgICBnZXREYXlGcm9tRGF5OiBnZXREYXlGcm9tRGF5XHJcbiAgICB9O1xyXG59KTtcclxuXHJcblxyXG5sdWtrYXJpU2VydmljZXMuZmFjdG9yeSgnTGVzc29ucycsIFsnJGh0dHAnLFxyXG4gICBmdW5jdGlvbiAoJGh0dHApIHtcclxuICAgICAgICB2YXIgbGVzc29ucyA9IFtdO1xyXG4gICAgICAgIHZhciBzYXZlZEdyb3VwTmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXQoZ3JvdXBOYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAoc2F2ZWRHcm91cE5hbWUgPT09IGdyb3VwTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobGVzc29ucyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzYXZlZEdyb3VwTmFtZSA9IGdyb3VwTmFtZTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0dWRlbnRHcm91cDogW2dyb3VwTmFtZS50b1VwcGVyQ2FzZSgpXVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHZhciBhcGlLZXkgPSAnV3U0N3p6S0VQYTdhZ3ZpbjQ3ZjUnO1xyXG4gICAgICAgICAgICAgICAgdmFyIHVybCA9ICdodHRwczovL29wZW5kYXRhLnRhbWsuZmkvcjEvcmVzZXJ2YXRpb24vc2VhcmNoJyArICc/YXBpS2V5PScgKyBhcGlLZXk7XHJcbiAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgICAgICB3aXRoQ3JlZGVudGlhbHM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYXV0aG9yaXphdGlvbic6ICdCYXNpYyBWM1UwTjNwNlMwVlFZVGRoWjNacGJqUTNaalU2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2FjY2VwdC1sYW5ndWFnZSc6ICdmaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdjYWNoZS1jb250cm9sJzogJ25vLWNhY2hlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YS5yZXNlcnZhdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEucmVzZXJ2YXRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pLmVycm9yKGZ1bmN0aW9uIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXQ6IGdldFxyXG4gICAgICAgIH07XHJcbiAgIH1cclxuXSk7XHJcblxyXG4vLyBQT1NUOiBodHRwczovL2x1a2thcml0LnRhbWsuZmkvdGVlSGFrdS5waHAgXHJcbi8vIHNlYXJjaGVzIHRoZSBkYiBmb3IgbWF0Y2hlc1xyXG4vLyBmb3JtZGF0YTpcclxuLy8gaGFrdWtvaGRlPSZoYWt1a29oZGU9bmltaV9rb29kaSZoYWt1c2FuYT1rJUMzJUE0eXRldHQlQzMlQTR2eXlzXHJcbi8vIGh0dHBzOi8vbHVra2FyaXQudGFtay5maS9wYWl2aXRhS29yaS5waHA/dG9pbWludG89cmVmcmVzaCZjb2RlPWZhbHNlJnZpZXdSZXBseT10cnVlXHJcbi8vIHJlc3BvbnNlIC0tPiBodG1sXHJcbi8vIHVwZGF0ZXMgdGhlIGJhc2tldCB3aXRoIHRoZSByZXN1bHRzIChodG1sKVxyXG4vLyBodHRwczovL2x1a2thcml0LnRhbWsuZmkvdG90ZXV0dXNJbmZvLnBocD9jb2RlPTRBMDBDTjM2LTMwMDRcclxuLy8gcmVzcG9uc2UgLS0+IGh0bWxcclxuLy8gc2hvd3MgaW5mbyBhYm91dCB0aGUgY291cnNlIHdoZW4gb25lIGlzIGNsaWNrZWQgaW4gdGhlIGJhc2tldChodG1sKVxyXG5cclxubHVra2FyaVNlcnZpY2VzLmZhY3RvcnkoJ1RpbWV0YWJsZXMnLCBbJyRodHRwJywgJ2ljYWwnLCAnJGNvb2tpZXMnLCAnQXBpRW5kcG9pbnQnLCAnTXlEYXRlJyxcclxuZnVuY3Rpb24gKCRodHRwLCBpY2FsLCAkY29va2llcywgQXBpRW5kcG9pbnQsIE15RGF0ZSkge1xyXG4gICAgICAgIHZhciBhcHBvaW50bWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGVzIHBlcmZlY3QgaWNhbCwgQlVUIGF0IGxlYXN0IGFuZHJvaWQgZG9lc24ndCBzdXBwb3J0IGFkZGluZyBhIGNhbGVuZGFyXHJcbiAgICAgICAgLy8gc28gaXQncyB1bnVzZWQuXHJcbiAgICAgICAgZnVuY3Rpb24gdG9JQ0FMKCkge1xyXG4gICAgICAgICAgICB2YXIgdkNhbCA9IG5ldyBpY2FsLkNvbXBvbmVudChbJ3ZjYWxlbmRhcicsIFtdLCBbXV0pO1xyXG4gICAgICAgICAgICB2Q2FsLnVwZGF0ZVByb3BlcnR5V2l0aFZhbHVlKCdwcm9kaWQnLCAnLS8vTHVra2FyaSBnZW5lcmF0ZWQgY2FsZW5kYXInKTtcclxuICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBjb21wb25lbnQgZm9yIGVhY2ggYXBwb2ludG1lbnRcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcHBvaW50bWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB2RXZlbnQgPSBuZXcgaWNhbC5Db21wb25lbnQoJ3ZldmVudCcpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IGljYWwuRXZlbnQodkV2ZW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzZXQgcHJvcGVydGllc1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3VtbWFyeSA9IGFwcG9pbnRtZW50c1tpXS5zdW1tYXJ5ICsgJyAnICtcclxuICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudHNbaV0uY291cnNlTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RhdHVzID0gJ0FDQ0VQVEVEJztcclxuICAgICAgICAgICAgICAgIGV2ZW50Lm9yZ2FuaXplciA9IGFwcG9pbnRtZW50c1tpXS50ZWFjaGVyO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQubG9jYXRpb24gPSBhcHBvaW50bWVudHNbaV0ubG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICB2RXZlbnQuYWRkUHJvcGVydHlXaXRoVmFsdWUoJ2R0c3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGljYWwuVGltZS5mcm9tSlNEYXRlKGFwcG9pbnRtZW50c1tpXS5zdGFydERhdGUpKTtcclxuICAgICAgICAgICAgICAgIHZFdmVudC5hZGRQcm9wZXJ0eVdpdGhWYWx1ZSgnZHRlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGljYWwuVGltZS5mcm9tSlNEYXRlKGFwcG9pbnRtZW50c1tpXS5lbmREYXRlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGFsYXJtIFxyXG4gICAgICAgICAgICAgICAgdmFyIHZhbGFybSA9IG5ldyBpY2FsLkNvbXBvbmVudCgndmFsYXJtJyk7XHJcbiAgICAgICAgICAgICAgICB2YWxhcm0uYWRkUHJvcGVydHlXaXRoVmFsdWUoJ3RyaWdnZXInLCAnLVBUMTBNJyk7XHJcbiAgICAgICAgICAgICAgICB2YWxhcm0uYWRkUHJvcGVydHlXaXRoVmFsdWUoJ2FjdGlvbicsICdESVNQTEFZJyk7XHJcbiAgICAgICAgICAgICAgICB2YWxhcm0uYWRkUHJvcGVydHlXaXRoVmFsdWUoJ2Rlc2NyaXB0aW9uJywgJ1JlbWluZGVyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYWRkIGFsYXJtIHRvIGV2ZW5ldFxyXG4gICAgICAgICAgICAgICAgdkV2ZW50LmFkZFN1YmNvbXBvbmVudCh2YWxhcm0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFkZCBlbGVtZW50IHRvIGNhbFxyXG4gICAgICAgICAgICAgICAgdkNhbC5hZGRTdWJjb21wb25lbnQodkV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh2Q2FsLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdkNhbC50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFrZSBhIGh0dHAgZ2V0IHJlcXVlc3QgdGhhdCBhZGRzIHRoZSBncm91cCB0byB0aGUgc2hvcHBpbmcgYmluXHJcbiAgICAgICAgLy8sIHVzaW5nIHByb3h5IGlmIG5lZWRlZCAoaW4gZGV2ZWxvcG1lbnQpXHJcbiAgICAgICAgLy8gYW5kIHVzZSBjcmVkZW50aWFscyBzbyB0aGF0IGNvb2tpZXMgYXJlIHVzZWQuXHJcbiAgICAgICAgZnVuY3Rpb24gbWFrZVJlcXVlc3QoZ3JvdXBOYW1lLCBzdGFydERhdGUsIGVuZERhdGUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIC8vIGNsZWFyIGFwcG9pbnRtZW50c1xyXG4gICAgICAgICAgICBhcHBvaW50bWVudHMgPSBbXTtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIHBocHNlc3NpZCBjb29raWUsIGJlY2F1c2UgdGhlIHNlcnZlclxyXG4gICAgICAgICAgICAvLyBwaWxlcyB0aGUgZ3JvdXBzIGludG8gYSAnc2hvcHBpbmcgYmFza2V0J1xyXG4gICAgICAgICAgICAkY29va2llcy5yZW1vdmUoJ1BIUFNFU1NJRCcpO1xyXG4gICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBBcGlFbmRwb2ludC51cmwgKyAnL3BhaXZpdGFLb3JpLnBocD90b2ltaW50bz1hZGRHcm91cCZjb2RlPScgKyBncm91cE5hbWUudG9VcHBlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIHdpdGhDcmVkZW50aWFsczogdHJ1ZVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWZ0ZXIgd2UgZ2V0IHJlc3BvbnNlIGRvIG5ldyBxdWVyeSB0aGF0IGdldHMgdGhlIGljYWwgXHJcbiAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IEFwaUVuZHBvaW50LnVybCArICcvaWNhbGNyZWF0b3IucGhwP3N0YXJ0RGF0ZT0nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTXlEYXRlLmZvcm1hdERheShzdGFydERhdGUsIHRydWUpICsgJyZlbmREYXRlPScgKyBNeURhdGUuZm9ybWF0RGF5KGVuZERhdGUsIHRydWUpXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgaWNhbCBmcm9tIHRoZSByZXNwb25zZSBhbmQgcGFyc2UgaXRcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnRzID0gZ2V0RXZlbnRzKHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcHBvaW50bWVudCA9IHBhcnNlRXZlbnQoZXZlbnRzW2ldLCBpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnRzLnB1c2goYXBwb2ludG1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FsbCBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGZpbmlzaGVkXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soYXBwb2ludG1lbnRzKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJldHVybnMgd2Vla3MgYXBwb2ludG1lbnRzXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0V2Vlayhncm91cE5hbWUsIHdlZWtPZmZzZXQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzTW9uZGF5ID0gTXlEYXRlLmdldE1vbmRheShuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgdmFyIG1vbmRheSA9IE15RGF0ZS5nZXREYXlGcm9tRGF5KHRoaXNNb25kYXksIHdlZWtPZmZzZXQgKiA2KTtcclxuICAgICAgICAgICAgdmFyIHN1bmRheSA9IE15RGF0ZS5nZXREYXlGcm9tRGF5KG1vbmRheSwgNik7XHJcbiAgICAgICAgICAgIG1ha2VSZXF1ZXN0KGdyb3VwTmFtZSwgbW9uZGF5LCBzdW5kYXksIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJldHVybnMgZGF5cyBhcHBvaW50bWVudHNcclxuICAgICAgICBmdW5jdGlvbiBnZXREYXkoZ3JvdXBOYW1lLCBkYXlPZmZzZXQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXkgPSBNeURhdGUuZ2V0RGF5RnJvbVRvZGF5KGRheU9mZnNldCk7XHJcbiAgICAgICAgICAgIG1ha2VSZXF1ZXN0KGdyb3VwTmFtZSwgZGF5LCBkYXksIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJldHVybnMgYXBwb2ludG1lbnQgd2l0aCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgZnVuY3Rpb24gcGFyc2VFdmVudCh2RXZlbnQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciBhcHBvaW50bWVudCA9IHt9O1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgaWNhbC5FdmVudCh2RXZlbnQpO1xyXG4gICAgICAgICAgICAvLyB0cnkgdG8gcGFyc2UgdGhlIGljYWwgaW50byBsb2dpY2FsIGNvbXBvbmVudHMuLi5cclxuICAgICAgICAgICAgYXBwb2ludG1lbnQuc3VtbWFyeSA9IChldmVudC5zdW1tYXJ5LnNwbGl0KC9bMC05XSsvKVswXSk7XHJcbiAgICAgICAgICAgIGFwcG9pbnRtZW50LmNvdXJzZU51bWJlciA9IChldmVudC5zdW1tYXJ5LnNsaWNlKGFwcG9pbnRtZW50LnN1bW1hcnkubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIC8vIFRPRE8gY291bGQgbWFrZSB0aGlzIGludG8gYXJyYXksIGFuZCBsb29wIGluIHZpZXdzIGZvciBlYWNoIHBpZWNlLi4uXHJcbiAgICAgICAgICAgIGFwcG9pbnRtZW50LmxvY2F0aW9uID0gKGV2ZW50LmxvY2F0aW9uLnNwbGl0KCcgLSAnKVswXSk7XHJcbiAgICAgICAgICAgIC8vIHRyeSB0byBzcGxpdCBsb2NhdGlvbiBpbnRvIG5pY2VyIGJpdHMsIG1pZ2h0IGZhaWxcclxuICAgICAgICAgICAgLy8gaXQncyBub3Qgc3RhbmRhcmRpemVkLi5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LmxvY2F0aW9uSW5mbyA9IChldmVudC5sb2NhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIC5zbGljZShhcHBvaW50bWVudC5sb2NhdGlvbi5sZW5ndGggKyAyKSkuc3BsaXQoJywgJylbMF07XHJcbiAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5sb2NhdGlvbkluZm8yID0gKGV2ZW50LmxvY2F0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGFwcG9pbnRtZW50LmxvY2F0aW9uLmxlbmd0aCArIDIpKS5zcGxpdCgnLCAnKVsxXTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgYXBwb2ludG1lbnQubG9jYXRpb25JbmZvID0gZXZlbnQubG9jYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHRyeSB0byBnZXQgdGVhY2hlciBmcm9tIGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgIC8vIG1pZ2h0IGZhaWwsIGl0IGlzbid0IHN0YW5kYXJkaXplZCAuLi5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnRlYWNoZXIgPSAoZXZlbnQuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoL0hlbmtpbMO2XFwodFxcKTogLylbMV0pLnNwbGl0KC9SeWhtw6RcXCh0XFwpOiAvKVswXTtcclxuICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnRlYWNoZXIgPSBhcHBvaW50bWVudC50ZWFjaGVyO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBhcHBvaW50bWVudC50ZWFjaGVyID0gZXZlbnQuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHRyeSB0byBwYXJzZSBncm91cCBuYW1lLCBidXQgaXQgbWF5IGZhaWwuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgZmllbGQgaXNuJ3Qgc3RhbmRhcmRpemVkIGZvciBzb21lIHJlYXNvbi4uXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5ncm91cHMgPSAoZXZlbnQuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAuc2xpY2UoKGV2ZW50LmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgvUnlobcOkXFwodFxcKTogLylbMF0pLmxlbmd0aCkpLnNwbGl0KC9SeWhtw6RcXCh0XFwpOiAvKVsxXTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuZ3JvdXBzID0gZXZlbnQuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXBwb2ludG1lbnQuZ3JvdXBzID0gYXBwb2ludG1lbnQuZ3JvdXBzO1xyXG5cclxuICAgICAgICAgICAgLy8gdHJpbSBhbGwgZmllbGRzICh0aGV5IGFyZSBtZXNzeSBhcyBmdWNrKVxyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gYXBwb2ludG1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50W2tleV0gPSBhcHBvaW50bWVudFtrZXldLnRyaW0oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwb2ludG1lbnQuaWQgPSBpbmRleDtcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEtY29tbS9pY2FsLmpzL3dpa2kvUGFyc2luZy1iYXNpYy1pQ2FsZW5kYXJcclxuICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhcnREYXRlID0gZXZlbnQuc3RhcnREYXRlLnRvSlNEYXRlKCk7XHJcbiAgICAgICAgICAgIGFwcG9pbnRtZW50LmVuZERhdGUgPSBldmVudC5lbmREYXRlLnRvSlNEYXRlKCk7XHJcbiAgICAgICAgICAgIGFwcG9pbnRtZW50LmRheSA9IGV2ZW50LnN0YXJ0RGF0ZS5kYXlPZldlZWsoKSAtIDI7XHJcbiAgICAgICAgICAgIHJldHVybiBhcHBvaW50bWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJldHVybnMgYXJyYXkgY29udGFpbmluZyB2RXZlbnRzIGZyb20gdGhlIGljYWxcclxuICAgICAgICBmdW5jdGlvbiBnZXRFdmVudHMoaWNhbERhdGEpIHtcclxuICAgICAgICAgICAgLy8gcGFyc2UgaWNhbCB0byB2Q2FsIGZvcm1hdFxyXG4gICAgICAgICAgICB2YXIgdkNhbCA9IGljYWwucGFyc2UoaWNhbERhdGEpO1xyXG4gICAgICAgICAgICAvLyBleHRyYWN0IHRoZSB2Y2FsIChuZWVkZWQgZm9yIHRoaXMgdG8gd29yaywgbG9sKVxyXG4gICAgICAgICAgICB2YXIgY29tcCA9IG5ldyBpY2FsLkNvbXBvbmVudCh2Q2FsKTtcclxuICAgICAgICAgICAgLy8gcmV0dXJuIGFsbCB2ZXZlbnRzXHJcbiAgICAgICAgICAgIHJldHVybiBjb21wLmdldEFsbFN1YmNvbXBvbmVudHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJldHVybnMgYW4gYXBwb2ludG1lbnQgd2l0aCBpZCAoZm9yIHRoZSBzaW5nbGUgYXBwb2ludG1lbnQgdmlldylcclxuICAgICAgICBmdW5jdGlvbiBnZXRBcHBvaW50bWVudChpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXBwb2ludG1lbnRzW2lkXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFdlZWs6IGdldFdlZWssXHJcbiAgICAgICAgICAgIGdldEFwcG9pbnRtZW50OiBnZXRBcHBvaW50bWVudCxcclxuICAgICAgICAgICAgZ2V0RGF5OiBnZXREYXksXHJcbiAgICAgICAgICAgIHRvSUNBTDogdG9JQ0FMXHJcbiAgICAgICAgfTtcclxufV0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
