var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  cache = require('gulp-cache'),
  notify = require('gulp-notify'),
  del  = require('del');

gulp.task('clean', function(){
  return del('./dest/');
})

gulp.task('default', ['clean'], function(){
  return gulp.src('./src/{,*/}*.js')
    .pipe(gulp.dest('./dest'))
    .pipe(cache(uglify()))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dest'))
    .pipe(notify({message: 'gulp default task has done!'}))
})