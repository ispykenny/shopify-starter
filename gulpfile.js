const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('webpack');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const pump = require('pump');
const targetBrowsers = ['last 5 versions'];

//project paths
const PATHS = {
  scss: 'src/_scss/**/*.scss',
  scssincludes: [],
  jsentry: 'src/js/app.js',
  js: 'js/**/*.js',
  sitefiles: ['**/*.php'],
  dest: {
    css: 'assets/',
    js: 'dist/assets/js'
  }
};


const WEBPACK_CONFIG = {
  context: __dirname+'/src/js',
  entry: './_index.js',
  output: {
    path: __dirname+'/assets/',
    filename: 'app.bundle.js'
  },
  bail: false,
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|assets|_scss|dist|src)/,
      loader: 'babel-loader',
      query: {
        presets: [['env', {"targets": {"browsers": targetBrowsers }}]]
      }
    }]
  }
};

//webpack js bundle
gulp.task('webpack', () => {
  var webpackCompiler = webpack(WEBPACK_CONFIG);
  webpackCompiler.watch({}, (err, stats) => {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({chunks: false}));
  });
});



gulp.task('scss', () => {
  return gulp.src(PATHS.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: targetBrowsers
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(PATHS.dest.css))
});

gulp.task('minify-css', () => {
  return gulp.src('dist/assets/css/style.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/assets/css/'));
});

gulp.task('compress', function (cb) {
  pump([
        gulp.src('dist/assets/js/app.bundle.js'),
        uglify(),
        gulp.dest('dist/assets/js/')
    ],
    cb
  );
});


let taskDefaults = ['scss', 'webpack'];
let buildSite = ['minify-css', 'compress'];

gulp.task('build', buildSite);

gulp.task('default', taskDefaults, () => {
  gulp.watch(PATHS.scss, ['scss']);
});