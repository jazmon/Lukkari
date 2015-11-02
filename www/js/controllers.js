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

/*
https://lukkarit.tamk.fi/paivitaKori.php?toiminto=addGroup&code=14TIKOOT&viewReply=true
https://lukkarit.tamk.fi/icalcreator.php?startDate=26.10.2015&endDate=28.12.2015
*/
lukkariControllers.controller('TodayController', function ($scope, $http) {
    $scope.groupInfo = {};
    $scope.appointments = [];
    $scope.responseData = '';
    $scope.getTimetable = function () {

        $http({
            method: 'GET',
            url: 'https://lukkarit.tamk.fi/paivitaKori.php?toiminto=addGroup&code=' + $scope.groupInfo.group.toUpperCase(),
            withCredentials: true
        }).then(function (response) {
            $scope.responseData = response;

            $http({
                method: 'GET',
                url: 'https://lukkarit.tamk.fi/icalcreator.php?startDate=2.11.2015&endDate=28.12.2015'
            }).then(function (response) {
                $scope.responseData = response;
            });
        });
    };


});