var lukkariDirectives = angular.module('lukkari.directives', []);

lukkariDirectives.directive('timeRange', function() {
  return {
    template: '{{lesson.startDay.toLocaleTimeString' +
      '("fi-FI", {hour:"numeric", minute:"numeric"})}}' +
      ' — ' +
      '{{lesson.endDay.toLocaleTimeString' +
      '("fi-FI", {hour:"numeric", minute:"numeric"})}}'
  };
});

lukkariDirectives.directive('date', function() {
  return {
    template: '{{day.date.toLocaleDateString("fi-FI",' +
      ' {weekday: "short", day: "numeric", month:"numeric"})}}'
  };
});

lukkariDirectives.directive('ngLastRepeat', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function() {
          scope.$emit('ngLastRepeat' + (attr.ngLastRepeat ? '.' +
            attr.ngLastRepeat : ''));
        });
      }
    }
  };
});
