angular.module('lukkari.services')
  .factory('FoodService', ['$http', 'LunchEndPoint', 'ngXml2json',
    function($http, LunchEndPoint, ngXml2json) {
      var lunches = [];

      function parseLunch(element, index, array) {
        var i;
        var j;
        var lunch = {};
        // get date
        lunch.date = new Date(element.div[0].span.content[0]);
        // get dishes
        lunch.dishes = [];
        // remove 3 from length to ignore evening foods
        var length = element.div[1].div.length - 3;
        for (i = 0; i < length; i++) {
          var dish = {};
          dish.pricegroups = [];
          dish.allergies = [];
          dish.name = element.div[1].div[i].div.div.ul.li.div.div
            .div[0].div.div.content;
          if (dish.name.includes('Ravintola avoinna')) {
            continue;
          }
          // get pricing info
          // var length2;
          // try {
          //   length2 = element.div[1].div[i].div.div.ul.li.div.div.div[1].div
          //     .div.div.div.length;
          // } catch (e) {
          //   length2 = 0;
          // }
          //
          // for (j = 0; j < length2; j++) {
          //   var pricegroup = {};
          //   try {
          //     pricegroup.group = element.div[1].div[i].div.div.ul.li.div.div.div[
          //       1].div.div.div.div[j].div[0].div.div.p;
          //   } catch (e) {
          //     pricegroup.group = 'N/A';
          //   }
          //   try {
          //     pricegroup.price = element.div[1].div[i].div.div.ul.li.div.div.div[
          //       1].div.div.div.div[j].div[1].div.div.content;
          //   } catch (e) {
          //     pricegroup.price = '';
          //   }
          //
          //   dish.pricegroups.push(pricegroup);
          // }
          // // var pricegroup = {};
          // // pricegroup.group = element.div[1].div[i].div.div.ul.li.div.div.div[
          // //   1].div.div.div.div[j].div.div.div.p;
          // // pricegroup.price = element.div[1].div[i].div.div.ul.li.div.div.div[
          // //   1].div.div.div.div[j].div.div.div.p;
          //
          // // get allergy info
          // var length3 = element.div[1].div[i].div.div.ul.li.div.div.div[1].div
          //   .div.length;
          // for (j = 0; j < length3; j++) {
          //   var allergy = element.div[1].div[i].div.div.ul.li.div.div.div[1].div
          //     .div[j].div.div[0].div.div.p;
          //   dish.allergies.push(allergy);
          // }
          lunch.dishes.push(dish);
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
            url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fcampusravita.fi%2Fruokalista%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22view-grouping%22%5D'&format=json&diagnostics=true&callback="
          }).then(
            function successCallback(response) {
              var data = response.data.query.results.div;
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
