angular.module('lukkari.services')
  .factory('Search', ['$http', 'ApiEndpoint', 'ApiKey',
    function($http, ApiEndpoint, ApiKey) {
      function search({
        name, studentGroups, startDate, endDate, codes, successCallback,
        errorCallback
      }) {
        const url = [ApiEndpoint.url, '/realization/search',
          '?apiKey=', ApiKey.key
        ].join('');

        let data = {};
        if (name !== undefined) {
          data.name = name;
        }
        if (studentGroups !== undefined) {
          data.studentGroups = studentGroups;
        }
        if (startDate !== undefined) {
          data.startDate = startDate;
        }
        if (endDate !== undefined) {
          data.endDate = endDate;
        }
        if (codes !== undefined) {
          data.codes = codes;
        }

        console.log(data);
        $http({
          method: 'POST',
          url,
          data,
          withCredentials: true,
          headers: {
            'authorization': 'Basic V3U0N3p6S0VQYTdhZ3ZpbjQ3ZjU6',
            'accept-language': 'fi',
            'content-type': 'application/json',
            'cache-control': 'no-cache'
          }
        }).success((data, status, headers, config) => {
          successCallback(data);
        }).error((data, status, headers, config) => {
          errorCallback(status);
        });
      }
      return {
        search: search
      };
    }
  ]);
