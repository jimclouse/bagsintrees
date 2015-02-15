var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');
 
gulp.task('less', function () {
    return gulp.src('./public/less/**/*.less')

    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

// gulp.task('watch', function() {
//     return gulp.src('./public/less/**/*.less')
//         .pipe(watch('./public/less/**/*.less'))
//         .pipe(less())
//         .pipe(gulp.dest('./public/css'));

// });
gulp.task('watch', function() {
    gulp.watch('./public/less/**/*.less', ['less']);
});


gulp.task('default', ['less']);