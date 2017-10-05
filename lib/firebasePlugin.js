'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Firebase = require('firebase');
const FbConfig = require('../config/firebase.json');
const app = Firebase.initializeApp(FbConfig);
const db = app.database();

module.exports.register = (server, options, next) => {

    server.route({
        method: 'POST',
        path: '/{store}/{room}',
        config: {
            description: 'Firebase interface to manage stores',
            tags: ['api'],
            validate: {
                params: {
                    store: Joi.string().alphanum().trim(),
                    room: Joi.number()
                },
                payload: {
                    user: Joi.object().optional()
                }
            },
            description: 'Updates the state of a room',
            async handler(request, reply) {

                const { store, room } = request.params;
                const { user } = request.payload;
                const storeRef = db.ref(`/shops/${store}/probadores`);
                const storeData = await storeRef.once('value');

                const currentState = storeData.val()[room];
                if (!currentState) {
                    return reply(Boom.notFound(`The room ${room} does not exists at ${store} store`));
                }

                const roomPath = `/shops/${store}/probadores/${room}`;
                const roomRef = db.ref(roomPath);
                const updates = {
                    occupied: user ? true : false,
                    timestamp: Date.now(),
                    user: user || null
                };

                try {
                    const response = await roomRef.update(updates);
                    return reply({ status: 200, response });
                }
                catch (err) {
                    console.error(err.name);
                    console.error(err.message);
                    return reply(Boom.internal(`Error updating room ${room} at ${store} store`), err);
                }
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'firebase'
};
