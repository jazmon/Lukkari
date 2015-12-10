angular.module('lukkari.directives')
  .directive('date', [function() {
    return {
      restrict: 'A',
      scope: {
        day: '='
      },
      template: ['{{day.toLocaleDateString(', navigator.language, ',',
        ' {weekday: "short", day: "numeric", month:"numeric"})}}'
      ].join('')
    };
  }]);
