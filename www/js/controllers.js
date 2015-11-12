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

        $scope.moveDay = function (direction) {
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

        $scope.setGroup = function () {
            LocalStorage.set('groupName', $scope.groupInfo.group);
            $scope.modal.hide();
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.getWeek($scope.groupInfo.group, $scope.weekOffset, function (result) {
                $scope.appointments = result;
                if ($scope.appointments.length > 0) {
                    // set week start date
                    var startDate = MyDate.getMonday($scope.appointments[0].startDate);
                    $scope.week.start = MyDate.getLocaleDate(date, false);
                    // set week end date
                    var date = MyDate.getDayFromDay(startDate, 6);
                    $scope.week.end = MyDate.getLocaleDate(date, false);
                }
                $ionicLoading.hide();
            });
        }

        $scope.appointments = [];
        if ($scope.groupInfo.group != undefined) {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.getWeek($scope.groupInfo.group, $scope.weekOffset, function (result) {
                $scope.appointments = result;
                $scope.days = [];
                var startDate = MyDate.getMonday($scope.appointments[0].startDate);
                // loop whole week
                for (var i = 0; i < 7; i++) {
                    var day = {};
                    // get mon-sun day
                    day.date = MyDate.getDayFromDay(startDate, i);
                    day.appointments = [];
                    for (var j = 0; j < $scope.appointments.length; j++) {
                        var appointment = $scope.appointments[j];
                        // if is the same day
                        if (appointment.startDate.toDateString() === day.date.toDateString()) {
                            day.appointments.push(appointment);
                        }
                    }
                    $scope.days.push(day);
                }


                if ($scope.appointments.length > 0) {
                    // set week start date
                    var startDate = MyDate.getMonday($scope.appointments[0].startDate);
                    $scope.week.start = MyDate.getLocaleDate(date, false);
                    // set week end date
                    var date = MyDate.getDayFromDay(startDate, 6);
                    $scope.week.end = MyDate.getLocaleDate(date, false);
                }
                $ionicLoading.hide();
            });
        }

        $scope.moveWeek = function (direction) {
            if (direction === -1) {
                $scope.weekOffset -= 2;
            } else if (direction === 1) {
                $scope.weekOffset += 1;
            } else {
                throw new RangeError('Parameter out of range! Please use 1 or -1');
            }
            //var date = MyDate.getDayFromToday($scope.weekOffset);
            // $scope.currentDay = MyDate.getLocaleDate(date, false);
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.getWeek($scope.groupInfo.group, $scope.weekOffset, function (result) {
                $scope.appointments = result;
                if ($scope.appointments.length > 0) {
                    // set week start date
                    var startDate = MyDate.getMonday($scope.appointments[0].startDate);
                    $scope.week.start = MyDate.getLocaleDate(date, false);
                    // set week end date
                    var date = MyDate.getDayFromDay(startDate, 6);
                    $scope.week.end = MyDate.getLocaleDate(date, false);
                }
                $ionicLoading.hide();

            });
        }
}]);

lukkariControllers.controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform', '$cookies', '$timeout',
function ($scope, LocalStorage, $cordovaToast, $ionicPlatform, $cookies, $timeout) {
        $scope.groupInfo = {};
        $scope.groupInfo.group = LocalStorage.get('groupName');
        if (!$scope.groupInfo.group) {
            $scope.groupInfo.group = '';
        }

        $scope.changeGroup = function () {
            LocalStorage.set('groupName', $scope.groupInfo.group);
            // show toast that change was successful
            $ionicPlatform.ready(function () {
                try {
                    $cordovaToast.show('Group successfully changed!', 'long', 'center')
                        .then(function (success) {
                            $cookies.remove('PHPSESSID');
                        }, function (error) {});
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
}]);

// TODO
lukkariControllers.controller('SearchCtrl', ['$scope', 'LocalStorage',
function ($scope, LocalStorage) {

}]);