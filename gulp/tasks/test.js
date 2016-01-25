import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('test', ['browserSync'], () => {
  return runSequence('unit', 'protractor');
});
