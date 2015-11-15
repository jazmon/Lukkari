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
        }

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
        }

        $scope.appointments = [];
        if ($scope.groupInfo.group != undefined) {
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
        }
}]);

// controller for single appointment view
lukkariControllers.controller('AppointmentCtrl', ['$scope', 'Timetables', '$ionicLoading', '$stateParams',
function ($scope, Timetables, $ionicLoading, $stateParams) {
        $scope.appointment = Timetables.getAppointment($stateParams.id);
}]);

// controller for weekly view
lukkariControllers.controller('WeekCtrl', ['$scope', 'Timetables', '$ionicLoading', '$ionicModal', 'LocalStorage', 'MyDate',
function ($scope, Timetables, $ionicLoading, $ionicModal, LocalStorage, MyDate) {
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
        }

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
                for (var i = 0; i < 7; i++) {
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
                Timetables.toICAL();
                // hide the loading after done
                $ionicLoading.hide();
            });
        };

        // sets the group name
        $scope.setGroup = function () {
            LocalStorage.set('groupName', $scope.groupInfo.group);
            $scope.modal.hide();
            getAppointments();
        }

        $scope.appointments = [];
        if ($scope.groupInfo.group != undefined) {
            getAppointments();
        }

        // moves a week forwards/backwards
        $scope.moveWeek = function (direction) {
            $scope.weekOffset += direction;
            getAppointments();
        }
}]);

lukkariControllers.controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform', '$cookies', '$timeout', '$cordovaCalendar', 'Timetables',
function ($scope, LocalStorage, $cordovaToast, $ionicPlatform, $cookies, $timeout, $cordovaCalendar, Timetables) {
        $scope.groupInfo = {};
        $scope.reminder = {};
        var toastOptions = {
            duration: 'long',
            position: 'center'
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
                        window.location.href = '/';
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

            // get next weeks appointments
            Timetables.getWeek($scope.groupInfo.group, 1, function (result) {
                appointments = result;
                $ionicPlatform.ready(function () {
                    appointments.forEach(function (element, index, array) {
                        $cordovaCalendar.createEventWithOptions({
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
                            $cordovaToast.show('Calendar events successfully added!',
                                toastOptions.duration,
                                toastOptions.position);
                            console.log('successfully added to calendar');
                        }, function (err) {
                            $cordovaToast.show('Failed to add calendar events!',
                                toastOptions.duration,
                                toastOptions.position);
                        });
                    });
                });
            })
        };
}]);

// TODO
lukkariControllers.controller('SearchCtrl', ['$scope', 'LocalStorage',
function ($scope, LocalStorage) {

}]);