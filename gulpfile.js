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
var clean = require('gulp-clean');

// `npm install --save replace`
var replace = require('replace');
var replaceFiles = ['./www/js/app.js'];

var bases = {
  dist: 'www/',
  app: 'dev/'
};
// https://gist.github.com/justinmc/9149719
var paths = {
  sass: ['./scss/**/*.scss'],
  scripts: ['js/**/*.js'],
  libs: [''],
  styles: ['css/**/*.css'],
  html: ['index.html'],
  templates: ['templates/**/*.html'],
  images: ['img/**/*'],
  //extras: ['favicon.ico']
};

// default task to be run when gulp is run
gulp.task('default', ['clean', 'scripts', 'sass', 'copy']);

// generates css files from sass
gulp.task('sass',['clean'], function(done) {
  gulp.src(['./scss/ionic.app.scss', './scss/mystyle.app.scss'])
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
    .pipe(gulp.dest('www/js'));
});

// builds js
gulp.task('scripts', ['clean'], function() {
  gulp.src(bases.app + 'js/**/*.js')
    // initializes sourcemaps
    .pipe(sourcemaps.init())
    // babels js
    .pipe(babel())
    // dumps all js into same file
    .pipe(concat('bundle.js'))
    // sets destination folder
    .pipe(gulp.dest(bases.dist + 'js'))
    // renames file
    .pipe(rename('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(bases.dist + 'js'))
    // write sourcemaps
    .pipe(sourcemaps.write('.'));
});

// watches for changes and then runs these
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch('www/js/**/*.js', ['jshint']);
});

gulp.task('clean', function() {
  return gulp.src(bases.dist, {
      read: false
    })
    .pipe(clean());
});

gulp.task('copy', ['clean'], function() {
  // copy html
  console.log('copying html...');
  gulp.src(paths.html, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist));

  // copy templates
  console.log('copying templates...');
  gulp.src(paths.templates, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist + 'templates'));

  // copy styles
  console.log('copying styles...');
  gulp.src(paths.styles, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist + 'styles'));

  // copy images
  console.log('copying images...');
  gulp.src(paths.images, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist + 'img'));

  // copy lib scripts
  console.log('copying libs...');
  gulp.src(paths.libs, {cwd: 'dev/**'})
  .pipe(gulp.dest(bases.dist));

  // copy extra files
  //console.log('copying extras...');
  /*gulp.src(paths.extras, {cwd: bases.app})
  .pipe(gulp.dest(bases.dist));*/
});

gulp.task('release', ['clean', 'sass', 'scripts', 'copy']);

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
