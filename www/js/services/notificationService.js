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
        $ionicPlatform.ready(function() {
          if (use) {
            // remove all
            $cordovaLocalNotification.cancelAll().then(result =>
              console.log(result));
            // add next week from now
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
                  }).then(result => console.log('SUCCESS: ' +
                    result));
                });
              }
            });
            LocalStorage.set({
              key: 'useNotification',
              value: 'true'
            });
          } else {
            console.log('Removing all notifications');
            $cordovaLocalNotification.cancelAll().then(result =>
              console.log(result));
            LocalStorage.set({
              key: 'useNotification',
              value: 'false'
            });
          }
        });
      }

      return {
        useNotifications: useNotifications
      };
    }
  ]);
