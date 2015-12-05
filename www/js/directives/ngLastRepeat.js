angular.module('lukkari.directives')
  .directive('ngLastRepeat', ($timeout) => {
    return {
      restrict: 'A',
      link: (scope, element, attr) => {
        if (scope.$last === true) {
          $timeout(() => scope.$emit('ngLastRepeat' + (attr.ngLastRepeat ?
            '.' + attr.ngLastRepeat : '')));
        }
      }
    };
  });
