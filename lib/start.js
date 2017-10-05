// Load modules
'use strict';

const _ = require('lodash');
const Path = require('path');
const Config = require('getconfig');
const Hoek = require('hoek');
const Server = require('./index');


// Declare internals

const internals = {};

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
                        title: 'IronHack Microservice',
                        version: process.env.npm_package_version
                    },
                    expanded: 'full',
                    jsonEditor: true,
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
        {
            plugin: './firebasePlugin.js'
        }
    ]
};

internals.composeOptions = {
    relativeTo: __dirname
};

Server.init(internals.manifest, internals.composeOptions, (err, server) => {

    Hoek.assert(!err, err);
    console.log(process.env.npm_package_name + ' v' + process.env.npm_package_version + ' started at: ' + server.info.uri);
    // Wake up the daemon that estimates the wait time. In this same microservice ATM
    require('./estimateWait');
});
