'use strict';

var latest  = require('github-latest');
var path    = require('path');
var request = require('request');
var util    = require('util');
var yeoman  = require('yeoman-generator');
var yosay   = require('yosay');

var EvolveGenerator = yeoman.generators.Base.extend({
  initialize: function() {
    if (this.args.length) {
      this.framework = this.args[0];
    }

    if (this.framework && this.framework.indexOf('#') > 0) {
      this.branch = this.framework.split('#').pop() || 'master';
    }
  },

  listFrameworks: function() {
    if (this.framework) {
      return false;
    }

    var done    = this.async();
    var options = {
      url: 'https://api.github.com/orgs/evolution/repos',
      headers: {
        'User-Agent': 'evolution/generator-evolve',
      },
    };

    request(options, function(err, response, body) {
      if (err || response.statusCode !== 200) {
        console.error(response);

        throw err;
      }

      this.frameworks = JSON.parse(body).map(function(repo) {
        return repo.name;
      }).filter(function(name) {
        return name.match(/^\w+$/);
      });

      done();
    }.bind(this));
  },

  promptForFramework: function() {
    if (this.framework || !this.frameworks) {
      return false;
    }

    if (this.frameworks.length === 1) {
      this.framework = this.frameworks[0];

      return true;
    }

    var done = this.async();

    this.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Select a framework',
        choices: this.frameworks,
      }
    ], function(answers) {
      this.framework = answers.framework;
      done();
    }.bind(this));
  },

  validateFramework: function() {
    if (!this.framework) {
      throw new Error('No Evolution framework selected');
    }
  },

  getBranch: function() {
    if (this.branch) {
      return false;
    }

    var done = this.async();

    latest('evolution', this.framework, function(err, tag) {
      this.branch = tag || 'master'
      done();
    }.bind(this));
  },

  downloadBranch: function() {
    var done = this.async();

    this.remote('evolution', this.framework, this.branch, function(err, remote) {
      if (err) {
        throw err;
      }

      this.options['framework-path'] = remote.cachePath;
      done();
    }.bind(this));
  },

  normalizeFrameworkPath: function() {
    this.options['framework-path'] = path.normalize(this.options['framework-path']);
  },

  installDependencies: function() {
    var done  = this.async();
    var cwd   = process.cwd();

    process.chdir(this.options['framework-path']);

    this.npmInstall(this.options['framework-path'], { 'quiet': false }, function() {
      process.chdir(cwd);
      done();
    });
  },

  runFrameworkGenerator: function() {
    var Generator = require(this.options['framework-path']);
    var generator = new Generator(this.args, this.options);

    generator.run();
  },
});

module.exports = EvolveGenerator;
