import config from '../config';
import gulp from 'gulp';
import browserSync from 'browser-sync';

// Views task
gulp.task('views', function() {

  return gulp.src(config.locales.src)
    .pipe(gulp.dest(config.locales.dest))
    .pipe(browserSync.stream());

});
