import gulp from 'gulp';
import gulpSequence from 'gulp-sequence';

gulp.task('build', gulpSequence(
  'clean', [
    'manifest',
    'scripts',
    'moveignored',
    'styles',
    'pages',
    'locales',
    'images',
    'fonts',
    'webfonts',
    'chromereload'
  ]
));
