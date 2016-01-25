

export default {
  sourceDir: './www/',
  buildDir: './build/',

  styles: {
    src: 'scss/**/*.scss',
    dest: 'build/css',
    prodSourcemap: false,
    sassIncludePaths: ['']
  },

  scripts: {
    src: 'www/js/**/*.js',
    dest: 'build/js'
  },

  images: {
    src: 'www/images/**/*',
    dest: 'build/images'
  },

  fonts: {
    src: ['www/fonts/**/*'],
    dest: 'build/fonts'
  },

  locales: {
    src: 'www/locales/**/*.json',
    dest: 'build/locales'
  },

  assetExtensions: [
    'js',
    'css',
    'png',
    'jpe?g',
    'gif',
    'svg',
    'eot',
    'otf',
    'ttc',
    'ttf',
    'woff2?'
  ],

  views: {
    index: 'www/index.html',
    src: 'www/templates/**/*.html',
    dest: 'www/js'
  },

  gzip: {
    src: 'build/**/*.{html,xml,json,css,js,js.map,css.map}',
    dest: 'build',
    options: {}
  },

  browserify: {
    bundleName: 'main.js',
    prodSourcemap: false
  },

  test: {
    karma: 'test/karma.conf.js',
    protractor: 'test/protractor.conf.js'
  },

  init: function() {
    this.views.watch = [
      this.views.index,
      this.views.src
    ];

    return this;
  }
}.init();
