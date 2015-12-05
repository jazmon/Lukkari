angular.module('lukkari.directives')
  .directive('date', () => {
    return {
      template: ['{{day.date.toLocaleDateString("fi-FI",',
        ' {weekday: "short", day: "numeric", month:"numeric"})}}'
      ].join('')
    };
  });
