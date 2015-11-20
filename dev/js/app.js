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
    url: 'http://localhost:8100/api'
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