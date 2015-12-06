angular.module('lukkari.directives')
  .directive('timeRange', () => {
    return {
      template: ['{{lesson.startDay.toLocaleTimeString',
        '(', navigator.language, ', {hour:"numeric", minute:"numeric"})}}',
        ' — ' +
        '{{lesson.endDay.toLocaleTimeString',
        '(', navigator.language, ', {hour:"numeric", minute:"numeric"})}}'
      ].join('')
    };
  });
