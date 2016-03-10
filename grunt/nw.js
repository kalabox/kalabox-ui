'use strict';

/**
 * This file/module contains all configuration for nw things
 */

// NPM modules
var _ = require('lodash');
var nw = require('nw');

// Current app version
var version = require('./../package.json').version;

/*
 * Helper function to get platform
 */
var getPlatforms = function(grunt) {

  // All allowed platforms
  var allowed = ['win64', 'osx64', 'linux64'];

  // Build all platforms
  if (!grunt.option('platform')) {
    return allowed;
  }

  // Or allow platform user passed in
  else {
    return [grunt.option('platform')];
  }

};

/*
 * Helper function to generate our compress object
 */
var nwCompress = function(grunt) {

  // Start up an empty
  var compress = {};

  // Iterate through our platforms and add to the compress array
  _.forEach(getPlatforms(grunt), function(platform) {

    // Our zippy ext is different depending on the platform
    var zippyExt = (_.includes(platform, 'win')) ? '.zip' : '.tar.gz';
    var dev = (grunt.option('dev')) ? '-dev' : '';
    var archive = [
      'dist/kalabox-ui',
      platform,
      'v' + version + dev + zippyExt
    ];

    // Build our compress object
    compress[platform] = {
      options: {
        archive: archive.join('-')
      },
      files: [
        {
          expand: true,
          cwd: 'nw/Kalabox/' + platform + '/',
          src: ['**'],
          dest: 'Kalabox/'
        }
      ]
    };

  });

  // And finally return that which is compressed
  return compress;

};

/*
 * Helper function to generate our nw-builder objects
 * NOTE: we need to do this because our deps are different for each
 * platform
 */
var nwBuilder = function(grunt) {

  // Start up an empty
  var builder = {};

  // Iterate through our platforms and add to the build array
  _.forEach(getPlatforms(grunt), function(platform) {

    // Command options to build the nw app.
    builder[platform] = {
      options: {
        version: version,
        platforms: [platform],
        buildDir: 'nw',
        macIcns: './build/images/kalabox.icns'
        // @todo: Breaks mac build, see kalabox/kalabox#929
        //winIco: './build/images/kalabox.ico'
      },
      src: [
        './build/*',
        './build/assets/**/*',
        './build/deps/iso/*',
        './build/deps/' + platform + '/*',
        './build/deps/images/*',
        './build/images/**/*',
        './build/node_modules/**/*',
        './build/src/**/*'
      ]
    };

  });

  // And finally return the nwjs-builder commands.
  return builder;

};

/*
 * Helper function to generate npm build commands for a given platform
 */
var npmBuildCmd = function(grunt) {

  // Start a command collector
  var cmd = [];

  // Normal CMDz
  cmd.push('cd ./<%= buildDir %>');
  cmd.push('&&');
  cmd.push('npm install --production');

  // Allow non-production packages to be created
  if (!grunt.option('dev')) {
    cmd.push('&&');
    if (process.platform === 'win32') {
      cmd.push('copy');
    }
    else {
      cmd.push('cp');
    }
    cmd.push('"node_modules/kalabox/package.json"');
    cmd.push('"node_modules/kalabox/version.lock"');
  }

  // Give up all the glory
  return cmd.join(' ');

};

// Return the codes
module.exports = {

  /*
   * Compress our built NW packages
   */
  compress: nwCompress,

  /*
   * Build our NW packages
   */
  nwjs: nwBuilder,

  copy: {
    icns: {
      files: [
        {
          src: 'src/images/kalabox.icns',
          dest: 'nw/Kalabox/osx64/Kalabox.app/Contents/Resources/nw.icns'
        }
      ]
    },
    docs: {
      files: [
        {src: 'README.md', dest: 'nw/Kalabox/osx64/README.md'},
        {src: 'README.md', dest: 'nw/Kalabox/linux64/README.md'},
        {src: 'README.md', dest: 'nw/Kalabox/win64/README.md'},
        {src: 'TERMS.md', dest: 'nw/Kalabox/osx64/TERMS.md'},
        {src: 'TERMS.md', dest: 'nw/Kalabox/linux64/TERMS.md'},
        {src: 'TERMS.md', dest: 'nw/Kalabox/win64/TERMS.md'},
        {src: 'LICENSE.txt', dest: 'nw/Kalabox/osx64/LICENSE.txt'},
        {src: 'LICENSE.txt', dest: 'nw/Kalabox/linux64/LICENSE.txt'},
        {src: 'LICENSE.txt', dest: 'nw/Kalabox/win64/LICENSE.txt'},
        {
          src: 'node_modules/kalabox/scripts/uninstall-darwin.sh',
          dest: 'nw/Kalabox/osx64/uninstall.sh'
        },
        {
          src: 'node_modules/kalabox/scripts/uninstall-linux.sh',
          dest: 'nw/Kalabox/linux64/uninstall.sh'
        },
        {
          src: 'node_modules/kalabox/scripts/uninstall-win32.bat',
          dest: 'nw/Kalabox/win64/uninstall.bat'
        }
      ]
    }
  },

  /*
   * Helpers shell commands
   */
  shell: {

    /*
     * Run our NW app from built source
     */
    nw: {
      command: nw.findpath() + ' <%= buildDir %>',
      options: {
        execOptions: {
          maxBuffer: Infinity
        }
      }
    },

    /*
     * Npm install our prod deps before we nwjs task
     */
    build: npmBuildCmd

  },

  /**
   * Clean out the nw dirs
   */
  clean: {
    nw: [
      './nw',
      './dist'
    ]
  }

};
