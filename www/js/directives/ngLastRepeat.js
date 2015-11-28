angular.module('lukkari.directives')
  .directive('ngLastRepeat', function($timeout) {
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
