var lukkariDirectives = angular.module('lukkari.directives', []);

lukkariDirectives.directive('dayRange', function() {
  return {
    template: '{{lesson.startDay.toLocaleTimeString' +
    '("fi-FI", {hour:"numeric", minute:"numeric"})}}' +
    ' — ' +
    '{{lesson.endDay.toLocaleTimeString' +
    '("fi-FI", {hour:"numeric", minute:"numeric"})}}'
  };
});
