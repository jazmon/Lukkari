var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var replace = require('replace');
var replaceFiles = ['./www/js/app.js'];
//var gulpSequence = require('gulp-sequence');
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var Proxy = require('./gulp-connect-proxy');

var bases = {
  dist: 'dist/',
  app: 'www/'
};
// https://gist.github.com/justinmc/9149719
var paths = {
  sass: ['./scss/**/*.scss'],
  scripts: ['js/**/*.js'],
  libs: ['lib/**/*'],
  styles: ['css/**/*.css'],
  html: ['index.html'],
  templates: ['templates/**/*.html'],
  images: ['img/**/*'],
  //extras: ['favicon.ico']
};

// default task to be run when gulp is run
//gulp.task('default', ['release']);

// generates css files from sass
gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest(bases.app + 'css'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest(bases.app + 'css'));
  done();
});

gulp.task('serve', function() {
  return connect.server({
    root: bases.dist,
    port: 8100,
    middleware: function(connect, opt) {
      opt.route = '/api';
      opt.context = 'https://opendata.tamk.fi/r1';
      var proxy = new Proxy(opt);
      return [proxy];
    }
  });
});

// builds js
gulp.task('scripts', function(done) {
  gulp.src(bases.app + 'js/*.js')
    // initializes sourcemaps
    .pipe(sourcemaps.init())
    // babels js (Ecmascript 6 -> normal js)
    .pipe(babel())
    // dumps all js into same file
    .pipe(concat('bundle.js'))
    // sets destination folder
    .pipe(gulp.dest(bases.app + 'js/combined'))
    // renames file
    .pipe(rename('bundle.min.js'))
    .pipe(uglify({mangle: false}))
    // write sourcemaps
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(bases.app + 'js/combined'));
  done();
});

// watches for changes and then runs these
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.sass, ['sass-watch']);
  gulp.watch(bases.app + paths.scripts, ['scripts-watch']);
  gulp.watch(bases.app + paths.libs, ['copy-libs']);
  gulp.watch(bases.app + paths.html, ['copy-html']);
  gulp.watch(bases.app + paths.templates, ['copy-templates', 'copy-html']);
  gulp.watch(bases.app + paths.images, ['copy-images']);
  gulp.watch(bases.app + paths.styles, ['copy-styles']);
});

gulp.task('sass-watch', function(done) {
  runSequence('sass', 'copy-styles', done);
});

gulp.task('scripts-watch', function(done) {
  runSequence('scripts', 'copy-scripts', done);
});

gulp.task('clean', function(done) {
  gulp.src(bases.dist, {
      read: false
    })
    .pipe(clean());
  done();
});

gulp.task('copy-html', function(done) {
  // copy html
  console.log('Copying html...');
  gulp.src(paths.html, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist))
  .pipe(livereload());
  done();
});

gulp.task('copy-templates', function(done) {
  // copy templates
  console.log('Copying templates...');
  gulp.src(paths.templates, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist + 'templates'))
  .pipe(livereload());
  done();
});

gulp.task('copy-styles', function(done) {
  // copy styles
  console.log('Copying styles...');
  gulp.src(paths.styles, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist + 'css'))
  .pipe(livereload());
  done();
});

gulp.task('copy-images', function(done) {
  // copy images
  console.log('Copying images...');
  gulp.src(paths.images, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist + 'img'))
  .pipe(livereload());
  done();
});

gulp.task('copy-libs', function(done) {
  // copy lib scripts
  console.log('Copying libs...');
  gulp.src(paths.libs, {cwd: 'www/**'})
  .pipe(gulp.dest(bases.dist))
  .pipe(livereload());
  done();
});

gulp.task('copy-scripts', function(done) {
  // copy scripts
  console.log('Copying scripts...');
  gulp.src('js/combined/*', {cwd: bases.app})
  .pipe(gulp.dest(bases.dist + 'js/combined'))
  .pipe(livereload());
  done();
});

gulp.task('copy-extras', function(done) {
  // copy extra files
  // console.log('copying extras...');
  // gulp.src(paths.extras, {cwd: bases.app})
  // .pipe(gulp.dest(bases.dist));
  // done();
});

// copies all
gulp.task('copy', function(done) {
  runSequence(['copy-html', 'copy-templates', 'copy-styles',
   'copy-images', 'copy-libs', 'copy-scripts'], done);
});

// builds a release version
gulp.task('release', function(done) {
  runSequence('clean', ['sass', 'scripts'], 'copy', done);
});

// task for ionic serve to run.
//gulp.task('live', runSequence('release'));

// runs install bower
gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

// checks if git is installed
gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:',
      gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' +
      gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

// adds a proxy for http://localhost hosting (browser)
gulp.task('add-proxy', function() {
  return replace({
    regex: 'https://opendata.tamk.fi/r1',
    replacement: 'http://localhost:8100/api',
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});

// removes proxy for file:// hosting (device)
gulp.task('remove-proxy', function() {
  return replace({
    regex: 'http://localhost:8100/api',
    replacement: 'https://opendata.tamk.fi/r1',
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});
