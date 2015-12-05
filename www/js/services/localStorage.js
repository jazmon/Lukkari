angular.module('lukkari.services')
  .factory('LocalStorage', [function() {
    function get({key}) {
      return window.localStorage.getItem(key);
    }

    function set({key, value}) {
      return window.localStorage.setItem(key, value);
    }

    return {
      get: get,
      set: set
    };
  }]);
