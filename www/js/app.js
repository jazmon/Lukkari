angular.module('lukkari', ['ionic', 'lukkari.controllers',
    'lukkari.services', 'lukkari.directives', 'ionic-datepicker',
    'ionic-material', 'angularXml2json'
  ])
  .run(['$ionicPlatform',
    function($ionicPlatform) {
      $ionicPlatform.ready(() => {
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
    }
  ])

// http://blog.ionic.io/handling-cors-issues-in-ionic/
.constant('ApiEndpoint', {
  url: 'http://localhost:8100/api'
})

.constant('LunchEndPoint', {
  url: 'http://localhost:8100/lunch'
})
.constant('ApiKey', {
  key: 'Wu47zzKEPa7agvin47f5'
})

// menuContent-view is presented on the main view.
.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
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
      .state('app.realization', {
        url: '/search/:code',
        views: {
          'menuContent': {
            templateUrl: 'templates/realization.html',
            controller: 'RealizationCtrl'
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
      .state('app.todayLesson', {
        url: '/today/:id',
        views: {
          'menuContent': {
            templateUrl: 'templates/lesson.html',
            controller: 'LessonCtrl'
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
      .state('app.lesson', {
        url: '/week/:id',
        views: {
          'menuContent': {
            templateUrl: 'templates/lesson.html',
            controller: 'LessonCtrl'
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
      })
      .state('app.lunch', {
        url: '/lunch',
        views: {
          'menuContent': {
            templateUrl: 'templates/lunch.html',
            controller: 'LunchCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/today');
  }
]);

angular.module('lukkari.services', []);
angular.module('lukkari.controllers', ['ngCordova']);
angular.module('lukkari.directives', []);
