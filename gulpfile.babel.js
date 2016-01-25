global.isProd = false;
require('./gulp');
//
// import gulp from 'gulp';
// import gutil from 'gulp-util';
// import babel from 'gulp-babel';
// import uglify from 'gulp-uglify';
// import bower from 'bower';
// import concat from 'gulp-concat';
// import sass from 'gulp-sass';
// import minifyCss from 'gulp-minify-css';
// import rename from 'gulp-rename';
// import sh from 'shelljs';
// import sourcemaps from 'gulp-sourcemaps';
// import clean from 'gulp-clean';
// import replace from 'replace';
// import runSequence from 'run-sequence';
// import livereload from 'gulp-livereload';
// import connect from 'gulp-connect';
// import Proxy from './gulp-connect-proxy';
// import minifyHTML from 'gulp-minify-html';
// import stripDebug from 'gulp-strip-debug';
// import { Server } from 'karma';
//
// const replaceFiles = ['./www/js/app.js', './www/combinedJs/bundle.js',
//   './www/combinedJs/bundle.min.js'
// ];
//
// const bases = {
//   dist: 'dist/',
//   app: 'www/'
// };
// https://gist.github.com/justinmc/9149719
// const paths = {
//   sass: ['./scss/**/*.scss'],
//   scripts: ['js/**/*.js'],
//   libs: ['lib/**/*'],
//   styles: ['css/**/*.css'],
//   html: ['index.html'],
//   templates: ['templates/**/*.html'],
//   images: ['img/**/*'],
//   combinedScripts: ['combinedJs/*.js'],
//   controllers: ['js/controllers/*.js'],
//   services: ['js/services/*.js'],
//   directives: ['js/directives/*.js'],
//   app: ['js/app.js'],
//   locales: ['locales/**/*.json']
//   //extras: ['favicon.ico']
// };

// default task to be run when gulp is run
//gulp.task('default', ['release']);

// generates css files from sass
// gulp.task('sass', (done) => {
//   gulp.src(paths.sass)
//     .pipe(sass())
//     .on('error', sass.logError)
//     .pipe(gulp.dest(bases.app + 'css'))
//     .pipe(minifyCss({
//       keepSpecialComments: 0
//     }))
//     .pipe(rename({
//       extname: '.min.css'
//     }))
//     .pipe(gulp.dest(bases.app + 'css'));
//   done();
// });

// gulp.task('serve', () => {
//   return connect.server({
//     root: bases.dist,
//     port: 8100,
//     middleware: function(connect, opt) {
//       opt.route = '/api';
//       opt.context = 'https://opendata.tamk.fi/r1';
//       const proxy = new Proxy(opt);
//       return [proxy];
//     }
//   });
// });

// builds js
// gulp.task('scripts', () => {
//   return gulp.src([bases.app + paths.app, bases.app + paths.services,
//       bases.app + paths.directives, bases.app + paths.controllers
//     ])
//     // initializes sourcemaps
//     .pipe(sourcemaps.init())
//     // babels js (Ecmascript 6 -> normal js)
//     .pipe(babel())
//     // dumps all js into same file
//     .pipe(concat('bundle.js'))
//     // sets destination folder
//     .pipe(gulp.dest(bases.app + 'combinedJs'))
//     // renames file
//     .pipe(rename('bundle.min.js'))
//     // strip debug statements
//     .pipe(stripDebug())
//     .pipe(uglify({
//       mangle: true
//     }))
//     // write sourcemaps
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(bases.app + 'combinedJs'));
// });

// watches for changes and then runs these
// gulp.task('watch', () => {
// livereload.listen();
// gulp.watch(paths.sass, ['sass-watch']);
// gulp.watch(bases.app + paths.scripts, ['scripts-watch']);
// gulp.watch(bases.app + paths.libs, ['copy-libs']);
// gulp.watch(bases.app + paths.html, ['copy-html']);
// gulp.watch(bases.app + paths.templates, ['copy-templates', 'copy-html']);
// gulp.watch(bases.app + paths.images, ['copy-images']);
// gulp.watch(bases.app + paths.styles, ['copy-styles']);
// gulp.watch(bases.app + paths.locales, ['copy-locales']);
// gulp.watch(bases.app + 'js/admob.js', ['copy-extras']);
// });

// gulp.task('sass-watch', (done) => runSequence('sass', 'copy-styles', done));
//
// gulp.task('scripts-watch', (done) => runSequence('scripts', 'copy-scripts',
//   done));
//
// gulp.task('test', done => {
//   new Server({
//     configFile: __dirname + '/my.conf.js',
//     singleRun: true
//   }, done).start();
// });
//
// gulp.task('clean', (done) => {
//   gulp.src(bases.dist, {
//       read: false
//     })
//     .pipe(clean());
//   done();
// });
//
// gulp.task('copy-html', (done) => {
//   // copy html
//   console.log('Copying html...');
//   gulp.src(paths.html, {
//       cwd: bases.app
//     })
//     .pipe(gulp.dest(bases.dist))
//     .pipe(livereload());
//   done();
// });
//
// gulp.task('copy-templates', (done) => {
//   // copy templates
//   console.log('Copying templates...');
//   gulp.src(paths.templates, {
//       cwd: bases.app
//     })
//     .pipe(gulp.dest(bases.dist + 'templates'))
//     .pipe(livereload());
//   done();
// });
//
// gulp.task('copy-styles', (done) => {
//   // copy styles
//   console.log('Copying styles...');
//   gulp.src(paths.styles, {
//       cwd: bases.app
//     })
//     .pipe(gulp.dest(bases.dist + 'css'))
//     .pipe(livereload());
//   done();
// });
//
// gulp.task('copy-images', (done) => {
//   // copy images
//   console.log('Copying images...');
//   gulp.src(paths.images, {
//       cwd: bases.app
//     })
//     .pipe(gulp.dest(bases.dist + 'img'))
//     .pipe(livereload());
//   done();
// });
//
// gulp.task('copy-libs', (done) => {
//   // copy lib scripts
//   console.log('Copying libs...');
//   gulp.src(paths.libs, {
//       cwd: 'www/**'
//     })
//     .pipe(gulp.dest(bases.dist))
//     .pipe(livereload());
//   done();
// });

// gulp.task('copy-scripts', (done) => {
//   // copy scripts
//   console.log('Copying scripts...');
//   gulp.src(paths.combinedScripts, {
//       cwd: bases.app
//     })
//     .pipe(gulp.dest(bases.dist + 'js'))
//     .pipe(livereload());
//   done();
// });

// gulp.task('copy-extras', (done) => {
//   // copy extra files
//   console.log('copying extras...');
//   gulp.src('js/admob.js', {
//       cwd: bases.app
//     })
//     .pipe(gulp.dest(bases.dist + 'js'));
//   done();
// });

// gulp.task('copy-locales', (done) => {
//   console.log('Copying locales...');
//   gulp.src(paths.locales, {
//       cwd: bases.app
//     })
//     .pipe(gulp.dest(bases.dist + 'locales'))
//     //.pipe(gulp.dest('./platforms/android/assets/www/locales'))
//     .pipe(livereload());
//   done();
// });
//
// // copies all
// gulp.task('copy', (done) => runSequence(['copy-html', 'copy-templates',
//   'copy-styles', 'copy-images', 'copy-libs', 'copy-scripts',
//   'copy-locales', 'copy-extras'
// ], done));

// // builds a release version
// gulp.task('release', (done) => runSequence('clean', ['sass', 'scripts'], 'copy',
//   done));

// task for ionic serve to run.
//gulp.task('live', runSequence('release'));

// runs install bower
// gulp.task('install', ['git-check'], () => {
//   return bower.commands.install()
//     .on('log', function(data) {
//       gutil.log('bower', gutil.colors.cyan(data.id), data.message);
//     });
// });

// // checks if git is installed
// gulp.task('git-check', (done) => {
//   if (!sh.which('git')) {
//     console.log(
//       '  ' + gutil.colors.red('Git is not installed.'),
//       '\n  Git, the version control system, is required to download Ionic.',
//       '\n  Download git here:',
//       gutil.colors.cyan('http://git-scm.com/downloads') + '.',
//       '\n  Once git is installed, run \'' +
//       gutil.colors.cyan('gulp install') + '\' again.'
//     );
//     process.exit(1);
//   }
//   done();
// });

// adds a proxy for http://localhost hosting (browser)
// gulp.task('add-proxy', () => {
//   return replace({
//     regex: 'https://opendata.tamk.fi/r1',
//     replacement: 'http://localhost:8100/api',
//     paths: replaceFiles,
//     recursive: false,
//     silent: false,
//   });
// });
//
// // removes proxy for file:// hosting (device)
// gulp.task('remove-proxy', () => {
//   return replace({
//     regex: 'http://localhost:8100/api|http://192.168.0.100:8100/api',
//     replacement: 'https://opendata.tamk.fi/r1',
//     paths: replaceFiles,
//     recursive: false,
//     silent: false,
//   });
// });
//
// // adds a proxy for http://192.168.0.100 hosting (livereload android)
// gulp.task('add-proxy-device', () => {
//   return replace({
//     regex: 'https://opendata.tamk.fi/r1|http://localhost:8100/api',
//     replacement: 'http://192.168.0.100:8100/api',
//     paths: replaceFiles,
//     recursive: false,
//     silent: false,
//   });
// });
