gulp = require 'gulp'
watch = require 'gulp-watch'

stylus = require 'gulp-stylus'
nib = require 'nib'
pleeease = require 'gulp-pleeease'

rawJade = require 'jade'
jade = require 'gulp-jade'

coffee = require 'gulp-coffee'


gulp.task 'stylus', ->
  return gulp.src ["./**/!(_)*.styl"]
    .pipe stylus
      compress: true
      use: nib()
    .pipe pleeease
      fallbacks:
        autoprefixer: ['last 2 version']
        optimizers:
          minifier: true
    .pipe gulp.dest "./"

gulp.task 'jade', ->
  return gulp.src ["./**/!(_)*.jade"]
    .pipe jade
      jade: rawJade
    .pipe gulp.dest "./"


gulp.task "coffee", ->
  return gulp.src "./**/!(_)*.coffee"
    .pipe coffee
      bare: true
    .pipe gulp.dest "./"

gulp.task "coffee", ->
  return gulp.src "./**/!(_)*.coffee"
    .pipe coffee
      bare: true
    .pipe gulp.dest "./"


gulp.task 'default', ['stylus', 'jade', 'coffee']

gulp.task 'develop', ['default'], ->
  watch ["./**/*.styl"], () ->
    gulp.start 'stylus'
  watch ["./**/*.jade"], () ->
    gulp.start 'jade'
  watch ["./**/*.coffee"], () ->
    gulp.start 'coffee'
