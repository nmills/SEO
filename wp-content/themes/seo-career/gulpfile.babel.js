'use strict';

// WordPress Starterkit Gulpfile
// (c) Blue State Digital

// TASKS
// ------
// `gulp`: watch, compile styles and scripts; Browserify
// `gulp build`: default compile task

// PLUGINS
// --------
import browserSync from 'browser-sync';
import browserify from 'browserify';
import del from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import styleguide from 'sc5-styleguide';
import sourcestream from 'vinyl-source-stream';

// VARIABLES
// ----------
const $ = gulpLoadPlugins();
const sync = browserSync.create();

const dist = 'assets';
const appRoot = '/wp-content/themes/seo-career/assets';
const source = 'src';
const child_path = '/wp-content/themes/seo-career/src';

// BUILD SUBTASKS
// ---------------

// Styles
gulp.task('stylelint', function() {
  return gulp.src([
    `${source}/scss/**/*.s+(a|c)ss`,
    `${source}/scss/**/*.css`,
    `!${source}/scss/vendor/**`,
  ])
  .pipe($.stylelint({
    reporters: [
      {
        formatter: 'string',
        console: true,
      },
    ],
  }));
});

gulp.task('styles', function() {
  return gulp.src([
    `${source}/scss/style.scss`,
  ])
  .pipe($.sourcemaps.init())
  .pipe($.sass({includePaths: ['node_modules']}))
    .on('error', $.notify.onError())
  .pipe($.autoprefixer())
  .pipe($.cleanCss())
  .pipe($.sourcemaps.write('./'))
  .pipe(gulp.dest('./'))
  .pipe(sync.stream({match: '**/*.css'}));
});

// Lint JavaScript
gulp.task('lint', () =>
  gulp.src([
    `${source}/js/**/*.js`,
    'gulpfile.babel.js',
    '!node_modules/**',
    `!${source}/js/vendor/**`,
  ]).pipe($.eslint())
  .pipe($.eslint.format())
);

// Browserify
gulp.task('browserify', function() {
  return browserify({
    entries: `${source}/js/main.js`,
    debug: true,
    paths: ['node_modules', `${source}/js`],
  })
  .transform('babelify', {presets: ['es2015']})
  .bundle()
  .pipe(sourcestream('bundle.js'))
  .pipe(gulp.dest(`${dist}/js`));
});

// Scripts
gulp.task('scripts', ['browserify'], function() {
  return gulp.src([
    `${source}/js/vendor/_*.js`,
    `${dist}/js/bundle.js`,
  ])
  .pipe($.babel({
    presets: ['es2015'],
    compact: true,
  }))
  .pipe($.concat('source.dev.js'))
  .pipe(gulp.dest(`${dist}/js`))
  .pipe($.rename('source.js'))
  .pipe($.uglify())
  .pipe(gulp.dest(`${dist}/js`))
  .pipe(sync.stream({match: '**/*.js'}));
});

// Clean
gulp.task('clean', function(cb) {
  del([`${dist}/js/source.dev.js`, `${dist}/js/source.js`], cb);
});

// Images
gulp.task('images', function() {
  return gulp.src(`${source}/img/**/*`)
    .pipe($.cache($.imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest(`${dist}/img`))
    .pipe($.notify({message: 'Images task complete'}));
});

// Generate Styleguide
gulp.task('styleguide:generate', function() {
  return gulp.src([`${source}/scss/**/_*.scss`])
  .pipe(styleguide.generate({
    title: 'Styleguide',
    rootPath: `${dist}/styleguide'`,
    appRoot: `${appRoot}/styleguide`,
    overviewPath: 'styleguide-overview.md',
    extraHead: [
      `<script type="text/javascript" src="${child_path}/js/vendor/jquery.js?ver=2.1.14"></script>`,
      `<script src="${appRoot}/js/source.dev.js"></script>`,
    ],
    disableEncapsulation: true,
  }))
  .pipe(gulp.dest(`${dist}/styleguide`));
});

// Apply styles to styleguide
gulp.task('styleguide:applystyles', function() {
  return gulp.src(`${source}/scss/style.scss`)
  .pipe($.sass({includePaths: ['node_modules']}))
    .on('error', $.notify.onError())
  .pipe(styleguide.applyStyles())
  .pipe(gulp.dest(`${dist}/styleguide`));
});

// Update reference screenshots
gulp.task('backstopjs:reference', function() {
  gulp.src('./node_modules/backstopjs/gulpfile.js')
  .pipe($.chug({tasks: ['reference']}));
});

// Test current screenshots against reference
gulp.task('backstopjs:test', function() {
  gulp.src('./node_modules/backstopjs/gulpfile.js')
  .pipe($.chug({tasks: ['test']}));
});


// BUILD TASKS
// ------------

// Build styleguide
gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);

// Watch
gulp.task('default', function() {
  sync.init({
    proxy: '[YOUR URL]',
    port: 3001,
    ghostMode: {
      scroll: true,
    },
    open: false,
  });

  // Watch .scss files
  gulp.watch(`${source}/scss/**/*.scss`, ['styles', 'styleguide']);

  // Watch .js files
  gulp.watch(`${source}/js/**/*.js`, ['scripts']);

  // Watch image files
  gulp.watch(`${source}/img/**/*`, ['images']);

  // Watch templates, JS, and CSS, reload on change
  gulp.watch(['bsdstarter/**/*'], {dot: true}).on('change', sync.reload);
});

// Build
gulp.task('build', ['clean'], function() {
  gulp.start('styles', 'scripts', 'styleguide');
  // gulp.start('styles', 'scripts', 'styleguide', 'backstopjs:test');
});
