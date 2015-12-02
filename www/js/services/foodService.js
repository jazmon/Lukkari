angular.module('lukkari.services')
  .factory('FoodService', ['$http', 'LunchEndPoint', 'ngXml2json',
    function($http, LunchEndPoint, ngXml2json) {
      let lunches = [];

      function parseLunch(element, index, array) {
        let lunch = {
          // get date
          date: new Date(element.div[0].span.content[0]),
          dishes: []
        };
        // remove 3 from length to ignore evening foods
        const length = element.div[1].div.length - 3;
        for (let i = 0; i < length; i++) {
          let dish = {};
          dish.pricegroups = [];
          dish.allergies = [];
          dish.name = element.div[1].div[i].div.div.ul.li.div.div
            .div[0].div.div.content;
          if (!dish.name.includes('Ravintola avoinna')) {
            lunch.dishes.push(dish);
          }
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
              'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%2',
              '0html%20where%20url%3D%22http%3A%2F%2Fcampusravita.fi%2Fruokali',
              'sta%22%20and%0A%20%20%20%20%20%20xpath%3D\'%2F%2Fdiv%5B%40class',
              '%3D%22view-grouping%22%5D\'&format=json&diagnostics=true&callba',
              'ck='
            ].join('')

          }).then(
            function successCallback(response) {
              const data = response.data.query.results.div;
              data.forEach(parseLunch);
              callback(lunches);
            },
            function errorCallback(response) {});
        }
      }

      return {
        get: get
      };
    }
  ]);
