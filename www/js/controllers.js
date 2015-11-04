/*jslint devel: true, sloppy: true*/
/*global angular*/
var lukkariControllers = angular.module('lukkari.controllers', []);

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

function formatDay(day) {
    var dayString = '';
    dayString += day.getDate();
    dayString += '.';
    dayString += (day.getMonth() + 1);
    dayString += '.';
    dayString += day.getFullYear();

    return dayString;
}

// TODO: merge this and the other getday, only give parameter offset to current day millis
function getCurrentDay() {
    var today = new Date();
    var todayString = formatDay(today);
    return todayString;
}

function getEndDate() {
    var day = Date.now();
    // add 7 weeks worth of millisecs
    day += 4233600000;
    var endDate = new Date(day);
    var dayFormatted = formatDay(endDate);
    return dayFormatted;
}

/*
https://lukkarit.tamk.fi/paivitaKori.php?toiminto=addGroup&code=14TIKOOT&viewReply=true
https://lukkarit.tamk.fi/icalcreator.php?startDate=26.10.2015&endDate=28.12.2015
*/
lukkariControllers.controller('TodayController', ['$scope', '$http', 'ical',

    function ($scope, $http, ical) {
        $scope.groupInfo = {};
        $scope.groupInfo.group = "14tikoot";
        $scope.appointments = [];
        $scope.responseData = '';
        $scope.today = getCurrentDay();
        $scope.endDate = getEndDate();
        $scope.getTimetable = function () {
            $http({
                method: 'GET',
                url: 'https://lukkarit.tamk.fi/paivitaKori.php?toiminto=addGroup&code=' + $scope.groupInfo.group.toUpperCase(),
                withCredentials: true
            }).then(function (response) {
                $http({
                    method: 'GET',
                    url: 'https://lukkarit.tamk.fi/icalcreator.php?startDate=' +
                        getCurrentDay() + '&endDate=' + getEndDate()
                }).then(function (response) {
                    $scope.responseData = response;
                    var vCal = ical.parse(response.data);
                    var comp = new ical.Component(vCal);
                    var vEvents = comp.getAllSubcomponents();
                    $scope.appointments = [];
                    for (var i = 0; i < vEvents.length; i++) {
                        var appointment = {};
                        appointment.summary = vEvents[i].getFirstPropertyValue("summary");

                        $scope.appointments.push(appointment);
                    }
                    /*$scope.appointments = vCal[2];
                    for (var key in $scope.appointments[0][1][7]) {
                        console.log(key + ': ' + $scope.appointments[0][1][7][key]);
                    }*/

                });
            });
        };
    }]);