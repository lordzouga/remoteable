import gulp from 'gulp';
import gulpif from 'gulp-if';
import livereload from 'gulp-livereload';
import args from './lib/args';

gulp.task('webfonts', () => {
  return gulp.src('app/webfonts/**/*.{woff,woff2,ttf,eot,svg}')
    .pipe(gulp.dest(`dist/${args.vendor}/webfonts`))
    .pipe(gulpif(args.watch, livereload()));
});
