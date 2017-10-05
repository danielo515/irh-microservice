// Load modules

var _ = require('lodash');
var Path = require('path');
var Config = require('getconfig');
var Hoek = require('hoek');
var Server = require('./index');


// Declare internals

var internals = {};

internals.manifest = {
  connections: [
    {
      port: process.env.PORT || Config.server.port || 8000
    }
  ],
  registrations: [
    {
      plugin: 'inert'
    },
    {
      plugin: 'vision'
    },
    {
      plugin: 'lout'
    },
    {
      plugin: {
        register: 'hapi-swagger',
        options: {
          info: {
            title: 'Documentation',
            version: process.env.npm_package_version
          },
          pathPrefixSize: 2
        }
      }
    },
    {
      plugin: {
        register: 'good',
        options: {
          reporters: {
            consoleReporter: [{
              module: 'good-console',
              args: [{ log: '*', response: '*' }]
            }, 'stdout']
          }
        }
      }
    },
    {
      plugin: './version'
    },
  ]
};

internals.composeOptions = {
  relativeTo: __dirname
};

Server.init(internals.manifest, internals.composeOptions, function (err, server) {

  Hoek.assert(!err, err);
  console.log(process.env.npm_package_name + ' v' + process.env.npm_package_version + ' started at: ' + server.info.uri);
});
