angular.module('lukkari.directives')
  .directive('date', [function() {
    return {
      restrict: 'A',
      scope: {
        day: '='
      },
      //TODO Try to replace with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat as it would be faster. Might need to do it in the controller though, so that we don't have to create the object multiple times

      // template: function(scope, element, attr) {
      //   console.log(element);
      //   console.log(typeof element.formatdate);
      //   if (typeof element.formatdate !== 'undefined') {
      //     return formatter(attr.day);
      //   } else {
      //     console.log('formatter undefined');
      //   }
      // }

      template: ['{{day}}'
      ].join('')
    };
  }]);
