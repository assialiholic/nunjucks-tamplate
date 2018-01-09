const gulp = require('gulp'),
      runSequence = require('run-sequence'),
      browserSync = require('browser-sync'),
      through2 = require('through2'),
      rimraf = require('rimraf'),
      p = require('gulp-load-plugins')();

const SRC = 'src',
      DEST = 'public_html',
      GUIDE = 'style_guide';

function plumberNotify(){
  return p.plumber({errorHandler: p.notify.onError("<%= error.message %>")});
}

// -------------------------------------------------------------------
// HTML
// -------------------------------------------------------------------

//nunjucksのコンパイル
gulp.task('njk', function(){
  return gulp.src([
    SRC + '/**/*.njk',
    '!src/_inc/*.njk'
  ])
  .pipe(p.using())
  .pipe(plumberNotify())
  .pipe(p.nunjucksRender({path:SRC +'/'}))
  .pipe(gulp.dest(DEST))
});


// -------------------------------------------------------------------
// CSS
// -------------------------------------------------------------------

//sassのコンパイル
gulp.task('sass', function () {
  return gulp.src([
    SRC + '/**/*.scss',
    '!src/**/_*.scss'
  ],{
    base: SRC
  })
  .pipe(p.using())
  .pipe(plumberNotify())
  .pipe(p.sourcemaps.init())
  .pipe(p.sass({outputStyle: 'expanded'}).on('error', p.sass.logError))
  .pipe(p.autoprefixer({
    browsers: ['last 2 versions', 'ie 10-11', 'iOS >= 8', 'Android >= 4.4'],
    cascade: false
  }))
  .pipe(p.sourcemaps.write('../' + DEST))
  .pipe(gulp.dest(DEST))
});



// -------------------------------------------------------------------
// JS
// -------------------------------------------------------------------
//JSチェック
gulp.task('eslint', function(){
  return gulp.src([
    SRC + '/**/*.js',
    '!src/**/jquery.*.js',
    '!src/**/*.min.js'
  ])
  .pipe(p.cached())
  .pipe(p.using())
  .pipe(plumberNotify())
  .pipe(p.eslint({useEslintrc: true}))
  .pipe(p.eslint.format())
  .pipe(p.eslint.failAfterError())
  .pipe(gulp.dest(DEST));
});


//clean
gulp.task('clean', function (cb) {
  rimraf(DEST, cb);
});


//copy
gulp.task('copy', function(){
  return gulp.src([
    SRC + '/**/*',
    '!src/**/*.scss',
    '!src/**/*.njk',
    '!src/_inc'
  ])
  .pipe(gulp.dest(DEST))
});


// -------------------------------------------------------------------
// コンパイル実行処理
// -------------------------------------------------------------------

//server
gulp.task('server', function(){
  browserSync({
    server: {
      baseDir: DEST,
      index: 'index.html'
    }
  });
});


//watch
gulp.task('watch', ['server'], function(){
  gulp.watch([
    SRC + '/**/*',
    '!src/**/*.scss',
    '!src/**/*.njk',
    '!src/_inc'
  ], ['copy', browserSync.reload]);
  gulp.watch([SRC + '/**/*.scss'], ['sass', browserSync.reload]);
  gulp.watch([SRC + '/**/*.js'], ['eslint', browserSync.reload]);
  gulp.watch([SRC + '/**/*.njk'], ['njk', browserSync.reload]);
});


gulp.task('default', function (cb) {
  runSequence(
    'clean',
    'copy',
    ['sass', 'njk'],
    'watch',
    cb
  );
});
