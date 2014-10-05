'use strict';

var chalk   = require('chalk');
var latest  = require('github-latest');
var path    = require('path');
var request = require('request');
var util    = require('util');
var yeoman  = require('yeoman-generator');
var yosay   = require('yosay');

var EvolveGenerator = yeoman.generators.Base.extend({
  init: function() {
    if (this.args.length) {
      if (this.args[0].indexOf('#') > 0) {
        this.branch     = this.args[0].split('#')[1];
        this.framework  = this.args[0].split('#')[0];
      } else {
        this.framework  = this.args[0];
      }
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
        throw new Error(body);
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

  setProjectName: function() {
    this.projectName = [
      chalk.dim('['),
      chalk.yellow('Evolution'),
      chalk.white(this.framework[0].toUpperCase() + this.framework.slice(1)),
      chalk.dim('Generator'),
      chalk.dim(']'),
    ].join(' ');

    this.log.info(this.projectName);
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
    if (this.options['framework-path']) {
      return false;
    }

    var done = this.async();

    this.log.info('Downloading', chalk.yellow('evolution') + '/' + chalk.white(this.framework) + '@' + chalk.dim(this.branch));

    this.remote('evolution', this.framework, this.branch, function(err, remote) {
      if (err) {
        throw err;
      }

      this.options['framework-path'] = remote.cachePath;
      done();
    }.bind(this));
  },

  resolveFrameworkPath: function() {
    this.options['framework-path'] = path.resolve(this.options['framework-path'].split('~').join(process.env.HOME));

    this.log.info('Generator path:', chalk.white(this.options['framework-path']));
  },

  installDependencies: function() {
    var done  = this.async();
    var cwd   = process.cwd();

    process.chdir(this.options['framework-path']);

    this.log.info('Installing NPM dependencies...');

    this.npmInstall(this.options['framework-path'], { 'quiet': true }, function() {
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
