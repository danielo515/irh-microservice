'use strict';

const firebase = require('firebase');
const app = firebase.initializeApp({});

module.exports = (server, options, next) => {

    server.route({
        method: 'POST',
        path: '/{store}/{room}',
        config: {
            description: 'Updates the state of a room',
            handler(request, reply) {


            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'firebase'
};
