angular.module('lukkari.directives')
  .directive('timeRange', ['MyDate', function(MyDate) {
    return {
      scope: {
        startDate: '=start',
        endDate: '=end'
      },
      template: function(element, attrs) {
        console.log(element);
        console.log(attrs);
        console.log(typeof attrs.start);
        console.log(startDate);
        MyDate.getLocaleTime(attrs.startDate);
      }
      // template: [MyDate.getLocaleTime(startDate),
      //   ' — ' +
      //   MyDate.getLocaleTime(endDate)
      // ].join('')
    };
  }]);
