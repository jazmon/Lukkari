angular.module('lukkari.services')
  .factory('Notifications', ['LocalStorage', '$ionicPlatform',
    '$cordovaLocalNotification', 'Lessons', 'MyDate',
    function(LocalStorage, $ionicPlatform, $cordovaLocalNotification, Lessons,
      MyDate) {
      function useNotifications({
        use, timeOffset
      }) {
        // get notification ids from local storage
        let notificationIds = JSON.parse(LocalStorage.get({
          key: 'notifications'
        }));
        console.log('notificationIds:' + notificationIds);
        $ionicPlatform.ready(function() {
          if (use) {
            console.log('Adding notifications');
            Lessons.getWeek({
              day: new Date(),
              callback: response => {
                const lessons = response.weekLessons;
                lessons.forEach(lesson => {
                  let id;
                  if (!notificationIds) {
                    id = 0;
                    notificationIds = [];
                  } else {
                    id = notificationIds[notificationIds.length -
                        1] +
                      1;
                  }
                  notificationIds.push(id);
                  LocalStorage.set({
                    key: 'notifications',
                    value: JSON.stringify(notificationIds)
                  });
                  // console.log([lesson.room, ', ', lesson.startDay
                  //   .toLocaleTimeString('fi-FI', {
                  //     hour: 'numeric',
                  //     minute: 'numeric'
                  //   }), ' - ',
                  //   lesson.endDay.toLocaleTimeString(
                  //     'fi-FI', {
                  //       hour: 'numeric',
                  //       minute: 'numeric'
                  //     })
                  // ].join(''));
                  // console.log(MyDate.offsetDate({
                  //   date: lesson.startDay,
                  //   minutes: timeOffset
                  // }));
                  $cordovaLocalNotification.schedule({
                    id,
                    title: lesson.name,
                    text: [lesson.room, ', ', lesson.startDay
                      .toLocaleTimeString('fi-FI', {
                        hour: 'numeric',
                        minute: 'numeric'
                      }), ' - ',
                      lesson.endDay.toLocaleTimeString(
                        'fi-FI', {
                          hour: 'numeric',
                          minute: 'numeric'
                        })
                    ].join(''),
                    at: MyDate.offsetDate({
                      date: lesson.startDay,
                      minutes: timeOffset
                    })
                  }).then(result => console.log('GREAT SUCCESS: ' + result));
                });
              }
            });

          } else {
            console.log('Removing all notifications');
            $cordovaLocalNotification.cancelAll().then(result =>
              console.log(result));
          }
        });
      }

      return {
        useNotifications: useNotifications
      };
    }
  ]);
