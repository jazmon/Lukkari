'use strict';

import angular from 'angular';
import 'angular-ui-router';
import 'angular-animate';
import ionic from 'ionic';

import './templates';
import './filters';
import './controllers';
import './services';
import './directives';
import 'ng-i18next';
import 'ionic-datepicker';
import 'ionic-material';

const requires = [
  'ionic',
  'ui.router',
  'ngAnimate',
  'ng-i18next',
  'ionic-datepicker',
  'ionic-material',
  'lukkari.filters',
  'lukkari.controllers',
  'lukkari.services',
  'lukkari.directives'
];

window.lukkari = angular.module('lukkari', requires);

angular.module('lukkari').constant('lukkariSettings', require('./constants'));
angular.module('lukkari').config(require('./on_config'));
angular.module('lukkari').run(require('./on_run'));
angular.bootstrap(document, ['lukkari'], {
  strictDi: true
});
