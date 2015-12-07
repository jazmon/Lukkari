angular.module('lukkari.services')
  .factory('FoodService', ['$http',
    function($http) {
      let lunches = [];

      function parseLunch(element, index, array) {
        let lunch = {};
        try {
          lunch.main = element.div[0].div.div.content;
          if (element.div.length >= 2) {
            lunch.side = element.div[1].div.div.content;
          }
          if (element.div.length >= 3) {
            lunch.allergy = element.div[2].div.div.content;
          }
        } catch (e) {
          // if only one field is specified, eg. aamupuuro
          lunch.main = element.div.div.div.content;
        }

        lunches.push(lunch);
      }

      function get({
        callback
      }) {
        if (lunches.length > 0) {
          callback(lunches);
        } else {
          $http({
            method: 'GET',
            url: [
              'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%',
              '20html%20where%20url%3D%22http%3A%2F%2Fwww.campusravita.fi%2Fi',
              'ntra_menu_today.php%22%20and%0A%20%20%20%20%20%20xpath%3D\'%2F',
              '%2Fdiv%5B%40class%3D%22rivitys-intra%22%5D\'&format=json&diagn',
              'ostics=true&callback='
            ].join('')

          }).then(
            function successCallback(response) {
              // if no lunches (eg. weekend)
              if (response.data.query.results === null) {
                callback(lunches);
              } else {
                const data = response.data.query.results.div;
                data.forEach(parseLunch);
                callback(lunches);
              }
            },
            function errorCallback(response) {});
        }
      }

      return {
        get: get
      };
    }
  ]);
