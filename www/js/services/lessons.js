angular.module('lukkari.services')
  .factory('Lessons', ['$http', 'ApiEndpoint', 'MyDate',
    function($http, ApiEndpoint, MyDate) {
      let lessons = [];
      let savedGroupName;

      function parseLesson(element, index, array) {
        const lesson = {};
        lesson.id = index;
        lesson.startDay = new Date(element.startDate);
        lesson.endDay = new Date(element.endDate);
        lesson.groups = [];
        // parse the resources array
        const {
          resources
        } = element;
        resources.forEach((resource, index, array) => {
          switch (resource.type) {
            case 'realization':
              lesson.code = resource.code;
              lesson.name = resource.name;
              break;
            case 'room':
              lesson.room = resource.code;
              lesson.roomInfo = resource.parent.name;
              break;
            case 'student_group':
              lesson.groups.push(resource.code);
              break;
          }
        });
        lessons.push(lesson);
      }

      function get(callback) {
        const data = {
          studentGroup: [savedGroupName]
        };
        const url = [ApiEndpoint.url, '/reservation/search'].join('');
        let lang = 'en';
        if (navigator.language.includes('fi')) {
          lang = 'fi';
        }
        $http({
          method: 'POST',
          url,
          data,
          withCredentials: true,
          headers: {
            'authorization': 'Basic V3U0N3p6S0VQYTdhZ3ZpbjQ3ZjU6',
            'accept-language': lang,
            'content-type': 'application/json',
            'cache-control': 'no-cache'
          }
        }).success((data, status, headers, config) => {
          lessons = [];
          data.reservations.forEach(parseLesson);
          callback({
            success: false
          });
        }).error((data, status, headers, config) => {
          console.error('Failed to get lesson data!');
          callback({
            success: false
          });
        });
      }

      // private get method that just saves lessons
      // change group name method that changes group anme and uses private get method
      function changeGroup({
        groupName, callback
      }) {
        savedGroupName = groupName.toUpperCase();
        get(result => callback(result));
      }

      // get day method that returns one day's lessons using date
      function getDay({
        callback, day
      }) {
        if (!day || !day instanceof Date) {
          console.error('Error in date!');
          callback({
            success: false
          });
        } else {
          let dayLessons = [];

          function checkDay(lesson, index, array) {
            const date = lesson.startDay;
            if (date.getDate() === day.getDate() &&
              date.getMonth() === day.getMonth()) {
              dayLessons.push(lesson);
            }
          }

          lessons.forEach(checkDay);
          callback({
            success: true,
            dayLessons
          });
        }
      }

      // get week method that returns one week's lessons using startDate and week offset
      function getWeek({
        callback, day
      }) {
        let weekLessons = [];
        const startDate = new Date(day.getFullYear(), day.getMonth(),
          day.getDate());
        const endDate = MyDate.getDayFromDay({
          currentDay: day,
          offsetDays: 5
        });

        function checkLessonDate(lesson, index, array) {
          if (lesson.startDay >= startDate && lesson.startDay <= endDate) {
            weekLessons.push(lesson);
          }
        }
        lessons.forEach(checkLessonDate);
        callback({
          success: true,
          weekLessons
        });
      }

      //get day to day method that returns all appointments from day a to day b
      function getDayToDay({
        callback, startDate, endDate
      }) {
        const correctEndDate = MyDate.getDayFromDay({
          currentDay: endDate,
          offsetDays: 1
        });
        let retLessons = [];

        function checkLesson(lesson, index, array) {
          if (lesson.startDay >= startDate && lesson.startDay <=
            correctEndDate) {
            retLessons.push(lesson);
          }
        }

        lessons.forEach(checkLesson);
        callback({
          success: true,
          lessons: retLessons
        });
      }

      function getLesson(id) {
        return lessons[id];
      }

      return {
        changeGroup: changeGroup,
        getDay: getDay,
        getWeek: getWeek,
        getDayToDay: getDayToDay,
        getLesson: getLesson
      };
    }
  ]);
