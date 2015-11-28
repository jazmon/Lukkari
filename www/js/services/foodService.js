angular.module('lukkari.services')
  .factory('FoodService', ['$http', 'LunchEndPoint', 'ngXml2json',
    function($http, LunchEndPoint, ngXml2json) {
      var lunches = [];

      function parseLunch(element, index, array) {
        var lunch = {};
        lunch.date = new Date(element.div[0].span.content[0]);
        console.log(lunch.date);
        lunch.dish = element.div[1].div[0].div.div.ul.li.div.div
          .div[0].div.div.content;
        console.log(lunch.dish);
        lunch.dishes = [];
        // remove 3 from length to ignore evening foods
        var length = element.div[1].div.length - 3;
        for (var i = 0; i < length; i++) {
          var dish = element.div[1].div[i].div.div.ul.li.div.div
            .div[0].div.div.content;
          if (!dish.includes('Ravintola avoinna')) {
            lunch.dishes.push(dish);
          }
        }
        console.log(lunch.dishes);
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
            url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fcampusravita.fi%2Fruokalista%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22view-grouping%22%5D'&format=json&diagnostics=true&callback="
          }).then(
            function successCallback(response) {
              var data = response.data.query.results.div;
              console.log(data);
              // var testLunch = {};
              // var dateString = lunches[0].div[0].span.content[0];
              // testLunch.date = new Date(dateString);
              // testLunch.food = lunches[0].div[1].div[0].div.div.ul.li.div.div
              //   .div[0].div.div.content;
              // console.log(testLunch);
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
