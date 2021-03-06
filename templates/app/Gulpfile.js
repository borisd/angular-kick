"use strict";

var gulp            = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins         = gulpLoadPlugins();
var fs              = require('fs-extra');
var runSequence     = require('run-sequence');
var url             = require('url');
var proxy           = require('proxy-middleware');
var modRewrite      = require('connect-modrewrite');
var browserSync     = require('browser-sync');
var karma           = require('karma').server;
var production      = require('./production_tasks');
var ENV             = JSON.parse(fs.readFileSync(__dirname + '/environments.json', "utf8"));

var sources = {
  app:          'app',
  dependencies: 'dependencies.js',
  appScript:    'app/app.js',
  scripts:      'app/**/*.js',
  styles:       'app/assets/stylesheets/**/*.scss',
  mainStyle:    'app/assets/stylesheets/application.scss',
  images:       'app/assets/images/**',
  fonts:        'app/assets/fonts/**',
  views:        ['app/**/*.html', '!app/app.html'],
  index:        'app/app.html'
};

var destination;
var destinations = {
  development: '.tmp',
  production: 'public'
};

var catchError = function (err) {
  plugins.util.beep();
  return console.log(err);
};

gulp.task('default', function () {
  ENV = ENV['development'];
  destination = destinations.development;
  return runSequence('clean', 'dependencies', 'scripts', 'styles', 'images', 'views', 'index', 'fonts', 'server');
});

gulp.task('build', function () {
  ENV = ENV['production'];
  destination = destinations.production;
  return runSequence('clean',
    'productionDependencies',
    'productionScripts',
    'productionStyles',
    'productionImages',
    'productionViews',
    'productionIndex',
    'productionFonts');
});

gulp.task('clean',          clean);
gulp.task('fonts',          fonts);
gulp.task('styles',         styles);
gulp.task('index',          index);
gulp.task('views',          views);
gulp.task('images',         images);
gulp.task('dependencies',   dependencies);
gulp.task('scripts',        scripts);
gulp.task('test',           test);
gulp.task('server',         server);
gulp.task('reloadScripts',  reloadScripts);
gulp.task('reloadViews',    reloadViews);
gulp.task('reloadStyles',   reloadStyles);

gulp.task('productionDependencies', production.dependencies);
gulp.task('productionScripts',      production.scripts);
gulp.task('productionStyles',       production.styles);
gulp.task('productionImages',       production.images);
gulp.task('productionViews',        production.views);
gulp.task('productionIndex',        production.index);
gulp.task('productionFonts',        production.fonts);


function clean () {
  return gulp.src(destination, { read: false })
    .pipe(plugins.rimraf());
}

function fonts () {
  return gulp.src(sources.fonts, { base: sources.app })
    .pipe(plugins.plumber({ errorHandler: catchError }))
    .pipe(gulp.dest(destination));
}

function styles () {
  return gulp.src(sources.mainStyle, { base: sources.app })
    .pipe(plugins.changed(destination, {
      hasChanged: plugins.changed.compareSha1Digest
    }))
    .pipe(plugins.plumber({ errorHandler: catchError }))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(destination));
}

function index () {
  return gulp.src(sources.index)
    .pipe(plugins.plumber({ errorHandler: catchError }))
    .pipe(plugins.inject(gulp.src(sources.scripts, { read: false }), { relative: true }))
    .pipe(gulp.dest(destination));
}

function views () {
  var appName = JSON.parse(fs.readFileSync(__dirname + '/package.json', "utf8"))['name'];
  return gulp.src(sources.views, { base: sources.app })
    .pipe(plugins.changed(destination, {
      hasChanged: plugins.changed.compareSha1Digest
    }))
    .pipe(plugins.plumber({ errorHandler: catchError }))
    .pipe(plugins.html2js({
      outputModuleName: appName + '.templates',
      base: 'app/'
    }))
    .pipe(plugins.concat('templates.js'))
    .pipe(plugins.ngAnnotate())
    .pipe(gulp.dest(destination))
}

function images () {
  return gulp.src(sources.images, { base: sources.app })
    .pipe(plugins.plumber({ errorHandler: catchError }))
    .pipe(gulp.dest(destination));
}

function dependencies () {
  return gulp.src(sources.dependencies)
    .pipe(plugins.plumber({ errorHandler: catchError }))
    .pipe(plugins.include({ extensions: ['js'] }))
    .pipe(gulp.dest(destination));
}

function scripts () {
  return gulp.src([sources.scripts, sources.appScript])
    .pipe(plugins.changed(destination, {
      hasChanged: plugins.changed.compareSha1Digest
    }))
    .pipe(plugins.plumber({ errorHandler: catchError }))
    .pipe(plugins.replaceTask({ patterns: [{ json: ENV }] }))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.traceur())
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(destination));
}

function test (done) {
  return karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
}

function reloadScripts () { return runSequence('scripts', 'views', 'index'); }
function reloadViews  ()  { return runSequence('views', 'index'); }
function reloadStyles ()  { return runSequence('styles', 'index'); }

function server () {
  var proxyOptions;
  proxyOptions = url.parse(ENV['API_URL']);
  proxyOptions.route = '/api';
  browserSync({
    browser: ['google chrome', 'chrome'],
    notify: false,
    port: 3001,
    server: {
      baseDir: '.tmp',
      middleware: [proxy(proxyOptions), modRewrite(['!\\.\\w+$ /app.html [L]'])]
    }
  });
  gulp.watch(sources.scripts, ['reloadScripts', browserSync.reload]);
  gulp.watch(sources.views,   ['reloadViews',   browserSync.reload]);
  gulp.watch(sources.index,   ['reloadViews',   browserSync.reload]);
  gulp.watch(sources.styles,  ['reloadStyles',  browserSync.reload]);
}
