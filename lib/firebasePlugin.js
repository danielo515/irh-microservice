'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Firebase = require('firebase');
const FbConfig = require('../config/firebase.json');
const app = Firebase.initializeApp(FbConfig);
const db = app.database();

module.exports.register = (server, options, next) => {

    server.decorate('server', 'firebase', { db });
    return next();
};

exports.register.attributes = {
    name: 'firebase'
};
