angular.module('lukkari.directives')
  .directive('timeRange', function() {
    return {
      template: '{{lesson.startDay.toLocaleTimeString' +
        '("fi-FI", {hour:"numeric", minute:"numeric"})}}' +
        ' — ' +
        '{{lesson.endDay.toLocaleTimeString' +
        '("fi-FI", {hour:"numeric", minute:"numeric"})}}'
    };
  });
