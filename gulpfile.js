// npm install --global gulp
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

// `npm install --save replace`
var replace = require('replace');
var replaceFiles = ['./www/js/app.js'];

var paths = {
  sass: ['./scss/**/*.scss']
};

// default task to be run when gulp is run
gulp.task('default', ['lint', 'babel','watch']);

// generates css files from sass
gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

// Configure the jshint task (checks for errors when saving)
gulp.task('lint', function() {
  return gulp.src('www/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build-js', function() {
  return gulp.src('www/js/**/*.js')
    .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        // only uglify if gulp is ran with '--type production'
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

// builds js
gulp.task('babel', function() {
  return gulp.src('www/js/**/*.js')
    // initializes sourcemaps
    .pipe(sourcemaps.init())
        // babels js
        .pipe(babel())
        // dumps all js into same file
        .pipe(concat('bundle.js'))
        // sets destination folder
        .pipe(gulp.dest('dist'))
        // renames file
        .pipe(rename('bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
    // write sourcemaps
    .pipe(sourcemaps.write('.'));
});

// watches for changes and then runs these
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch('www/js/**/*.js', ['jshint']);
});

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

// adds a proxy for http://localhost:3000 hosting
gulp.task('add-proxy', function() {
  return replace({
    regex: 'https://lukkarit.tamk.fi',
    replacement: 'http://localhost:8100/api',
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});

// removes proxy for file:// hosting
gulp.task('remove-proxy', function() {
  return replace({
    regex: 'http://localhost:8100/api',
    replacement: 'https://lukkarit.tamk.fi',
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});
