module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    files: [
      'components/traceur-runtime/traceur-runtime.js',
      '.tmp/dependencies.js',
      '.tmp/templates.js',
      'components/angular-mocks/angular-mocks.js',
      '.tmp/modules.js',
      '.tmp/app.js',
      '.tmp/services/**/*.js',
      '.tmp/directives/**/*.js',
      '.tmp/filters/**/*.js',
      '.tmp/config/**/*.js',
      '.tmp/states/**/*.js',
      'test/mock/**.js',
      'test/unit/**/**.js'
    ],
    exclude: [
      ".tmp/app/assets/**",
      ".tmp/app/config/**"
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: false
  });
};
