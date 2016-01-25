'use strict';

function LocalStorage($http) {
  const service = {};

  service.get = function({key}) {
    return window.localStorage.getItem(key);
  };
  service.get = function({key, value}) {
    return window.localStorage.setItem(key, value);
  };

  return service;

}

export default {
  name: 'LocalStorage',
  fn: LocalStorage
};
