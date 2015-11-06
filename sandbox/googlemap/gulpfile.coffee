gulp = require 'gulp'
watch = require 'gulp-watch'

stylus = require 'gulp-stylus'
nib = require 'nib'
pleeease = require 'gulp-pleeease'

rawJade = require 'jade'
jade = require 'gulp-jade'

coffee = require 'gulp-coffee'

xml2json = require 'gulp-xml2json'
rename = require 'gulp-rename'

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

gulp.task 'data', ->
  return gulp.src "./data/**/*.xml"
    .pipe xml2json()
    .pipe rename
      extname: '.json'
    .pipe gulp.dest 'data'


gulp.task 'default', ['stylus', 'jade', 'coffee', 'data']

gulp.task 'develop', ['default'], ->
  watch ["./**/*.styl"], () ->
    gulp.start 'stylus'
  watch ["./**/*.jade"], () ->
    gulp.start 'jade'
  watch ["./**/*.coffee"], () ->
    gulp.start 'coffee'
