exports.config = {
  specs: [
    './e2e/**/*.spec.js',
    '../src/modules/*/test/e2e/**/*.spec.js'
  ],
  baseUrl: 'http://localhost:8000',
  chromeDriver:
    '../node_modules/grunt-protractor-runner/node_modules/protractor/selenium/chromedriver'
};
