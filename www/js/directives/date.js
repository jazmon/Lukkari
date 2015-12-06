angular.module('lukkari.directives')
  .directive('date', () => {
    return {
      template: ['{{day.date.toLocaleDateString(', navigator.language, ',',
        ' {weekday: "short", day: "numeric", month:"numeric"})}}'
      ].join('')
    };
  });
