var coffee, gulp, jade, nib, pleeease, rawJade, rename, stylus, watch, xml2json;

gulp = require('gulp');

watch = require('gulp-watch');

stylus = require('gulp-stylus');

nib = require('nib');

pleeease = require('gulp-pleeease');

rawJade = require('jade');

jade = require('gulp-jade');

coffee = require('gulp-coffee');

xml2json = require('gulp-xml2json');

rename = require('gulp-rename');

gulp.task('stylus', function() {
  return gulp.src(["./**/!(_)*.styl"]).pipe(stylus({
    compress: true,
    use: nib()
  })).pipe(pleeease({
    fallbacks: {
      autoprefixer: ['last 2 version'],
      optimizers: {
        minifier: true
      }
    }
  })).pipe(gulp.dest("./"));
});

gulp.task('jade', function() {
  return gulp.src(["./**/!(_)*.jade"]).pipe(jade({
    jade: rawJade
  })).pipe(gulp.dest("./"));
});

gulp.task("coffee", function() {
  return gulp.src("./**/!(_)*.coffee").pipe(coffee({
    bare: true
  })).pipe(gulp.dest("./"));
});

gulp.task("coffee", function() {
  return gulp.src("./**/!(_)*.coffee").pipe(coffee({
    bare: true
  })).pipe(gulp.dest("./"));
});

gulp.task('data', function() {
  return gulp.src("./data/**/*.xml").pipe(xml2json()).pipe(rename({
    extname: '.json'
  })).pipe(gulp.dest('data'));
});

gulp.task('default', ['stylus', 'jade', 'coffee', 'data']);

gulp.task('develop', ['default'], function() {
  watch(["./**/*.styl"], function() {
    return gulp.start('stylus');
  });
  watch(["./**/*.jade"], function() {
    return gulp.start('jade');
  });
  return watch(["./**/*.coffee"], function() {
    return gulp.start('coffee');
  });
});
