angular.module('lukkari.services')
  .factory('Notifications', ['LocalStorage', function(LocalStorage) {
    function useNotifications({
      use
    }) {

    }

    return {
      useNotifications: useNotifications
    };
  }]);
