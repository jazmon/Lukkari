var lukkariControllers = angular.module('lukkari.controllers', ['ngCordova']);

// insert needed sidemenu stuff here
lukkariControllers.controller('LukkariCtrl', function ($scope) {});

// controller for today view
lukkariControllers.controller('TodayCtrl', ['$scope', 'Timetables', '$ionicLoading', 'LocalStorage', '$ionicModal',
function ($scope, Timetables, $ionicLoading, LocalStorage, $ionicModal) {
        $scope.groupInfo = {};
        $scope.groupInfo.group = LocalStorage.get('groupName');
        $scope.dayOffset = 0;
        $scope.currentDay = 'Today';

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
            Timetables.get($scope.groupInfo.group, $scope.dayOffset, 0, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        }

        $scope.appointments = [];
        if ($scope.groupInfo.group != undefined) {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.get($scope.groupInfo.group, $scope.dayOffset, 0, function (result) {
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
            $scope.currentDay = Timetables.getDay($scope.dayOffset);
            $ionicLoading.show({
                template: 'Loading...'
            });
            $scope.appointments = [];
            Timetables.get($scope.groupInfo.group, $scope.dayOffset, 0, function (result) {
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
lukkariControllers.controller('WeekCtrl', ['$scope', 'Timetables', '$ionicLoading', '$ionicModal', 'LocalStorage',
function ($scope, Timetables, $ionicLoading, $ionicModal, LocalStorage) {
        $scope.groupInfo = {};
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
            Timetables.get($scope.groupInfo.group, 0, 6, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        }

        $scope.appointments = [];
        if ($scope.groupInfo.group != undefined) {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.get($scope.groupInfo.group, 0, 6, function (result) {
                $scope.appointments = result;
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