angular.module('lukkari.services')
  .factory('LocalStorage', [function() {
    function get(name) {
      return window.localStorage.getItem(name);
    }

    function set(name, value) {
      return window.localStorage.setItem(name, value);
    }

    return {
      get: get,
      set: set
    };
  }]);
