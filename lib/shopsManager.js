'use strict';

const Boom = require('boom');
const Joi = require('joi');

const makeRooms = (num) => {

    const rooms = [];

    while (rooms.length < num) {
        rooms.push({
            id: rooms.length,
            occupied: false
        });
    }
    return rooms;
};

module.exports.register = (server, options, next) => {

    const { db } = server.firebase;

    server.route({
        method: 'POST',
        path: '/shops/{id}',
        config: {
            cors: true,
            description: 'Firebase interface to manage stores',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().lowercase().trim()
                },
                payload: {
                    shop: Joi.object().keys({
                        name: Joi.string().lowercase().trim(),
                        estimatedWaitTime: Joi.number().integer().default(0),
                        count: Joi.number().integer().default(0),
                        amountTimeSpent: Joi.number().min(0).default(0),
                        wearAvg: Joi.number().min(0).integer().default(0),
                        geolocation: Joi.object({
                            lat: Joi.number().default(0),
                            lng: Joi.number().default(0)
                        }).default(),
                        wearCount: Joi.number().integer().min(0).default(0)
                    })
                }
            },
            description: 'Updates the state of a room',
            async handler(request, reply) {

                const { id } = request.params;
                const { shop } = request.payload;
                const storeRef = db.ref(`/shops/${id}`);

                shop.rooms = makeRooms(3);
                shop.id = id;

                try {
                    await storeRef.set(shop);
                    return reply({ status: 200, shop });
                }
                catch (err) {
                    console.error(err.name, err.message);
                    return reply(Boom.internal(`Error creating room with id ${id}`), err);
                }
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'shopsManager'
};
