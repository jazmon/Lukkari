var lukkariControllers = angular.module('lukkari.controllers', ['ngCordova']);

lukkariControllers.controller('LukkariCtrl', function ($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
});

lukkariControllers.controller('TodayCtrl', ['$scope', 'Timetables', '$ionicLoading', 'LocalStorage', '$ionicModal',
function ($scope, Timetables, $ionicLoading, LocalStorage, $ionicModal) {
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
            Timetables.get($scope.groupInfo.group, 0, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        }

        $scope.appointments = [];
        //$scope.getTimetable = function () {
        if ($scope.groupInfo.group != undefined) {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.get($scope.groupInfo.group, 0, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        }
        //};

        $scope.moveDay = function (direction) {
            if (direction === -1) {

            } else if (direction === 1) {

            } else {
                throw new RangeError('Parameter out of range! Please use 1 or -1');
            }
        }
}]);

lukkariControllers.controller('AppointmentCtrl', ['$scope', 'Timetables', '$ionicLoading', '$stateParams',
function ($scope, Timetables, $ionicLoading, $stateParams) {
        $scope.appointment = Timetables.getAppointment($stateParams.id);
}]);

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
            Timetables.get($scope.groupInfo.group, 6, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        }

        $scope.appointments = [];
        //$scope.getTimetable = function () {
        if ($scope.groupInfo.group != undefined) {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Timetables.get($scope.groupInfo.group, 6, function (result) {
                $scope.appointments = result;
                $ionicLoading.hide();
            });
        }
}]);

lukkariControllers.controller('SettingsCtrl', ['$scope', 'LocalStorage', '$cordovaToast', '$ionicPlatform',
function ($scope, LocalStorage, $cordovaToast, $ionicPlatform) {
        $scope.groupInfo = {};
        $scope.groupInfo.group = LocalStorage.get('groupName');
        if (!$scope.groupInfo.group) {
            $scope.groupInfo.group = '';
        }

        $scope.changeGroup = function () {
            LocalStorage.set('groupName', $scope.groupInfo.group);
            // show toast that change was successfull

            $ionicPlatform.ready(function () {
                //$cordovaPlugin.someFunction().then(success, error);
                $cordovaToast.show('Group successfully changed!', 'long', 'center')
                    .then(function (success) {

                    }, function (error) {

                    });
            });
        };
}]);

lukkariControllers.controller('SearchCtrl', ['$scope', 'LocalStorage',
function ($scope, LocalStorage) {

}]);