'use strict';

function OnConfig($stateProvider, $locationProvider, $urlRouterProvider) {
  'ngInject';

  $locationProvider.html5Mode(true);

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'LukkariCtrl as lukkari'
    })
    .state('app.search', {
      url: '/search',
      title: 'Search',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'SearchCtrl as search'
        }
      }
    })
    .state('app.realization', {
      url: '/search/:code',
      title: 'Realization',
      views: {
        'menuContent': {
          templateUrl: 'templates/realization.html',
          controller: 'RealizationCtrl as realization'
        }
      }
    })
    .state('app.settings', {
      url: '/settings',
      title: 'Settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl as settings'
        }
      }
    })
    .state('app.todayLesson', {
      url: '/today/:id',
      title: 'Lesson',
      views: {
        'menuContent': {
          templateUrl: 'templates/lesson.html',
          controller: 'LessonCtrl as lesson'
        }
      }
    })
    .state('app.today', {
      url: '/today',
      title: 'Today',
      views: {
        'menuContent': {
          templateUrl: 'templates/today.html',
          controller: 'TodayCtrl as today'
        }
      }
    })
    .state('app.lesson', {
      url: '/week/:id',
      title: 'Lesson',
      views: {
        'menuContent': {
          templateUrl: 'templates/lesson.html',
          controller: 'LessonCtrl as lesson'
        }
      }
    })
    .state('app.week', {
      url: '/week',
      views: {
        'menuContent': {
          templateUrl: 'templates/week.html',
          controller: 'WeekCtrl as week'
        }
      }
    })
    .state('app.lunch', {
      url: '/lunch',
      views: {
        'menuContent': {
          templateUrl: 'templates/lunch.html',
          controller: 'LunchCtrl as lunch'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/today');
}
