import gulp from 'gulp';
import gulpif from 'gulp-if';
import livereload from 'gulp-livereload';
import args from './lib/args';

gulp.task('moveignored', () => {
  return gulp.src(['app/scripts/bootstrap.js',
'app/scripts/jquery-2.0.3.js'])
    .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
    .pipe(gulpif(args.watch, livereload()));
});
