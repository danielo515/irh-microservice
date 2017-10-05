'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Firebase = require('firebase');
const FbConfig = require('../config/firebase.json');
const app = Firebase.initializeApp(FbConfig);
const db = app.database();

const updateUser = async (userInfo, roomInfo) => {

    if (!userInfo) {
        return {};
    }

    const userPath = `/users/${userInfo.userId}`;
    let user = await db.ref(`/users/${userInfo.userId}`).once('value');
    user = user.val();

    if (!user) {
        return {};
    }

    const { leftAt = Date.now(), timestamp } = roomInfo;
    const timeSpent = leftAt - timestamp;
    const { wearCount = 0, wearAvg = 0 } = user;

    const updateInfo = {
        wearAvg: ((wearCount * wearAvg) + timeSpent) / (wearCount + userInfo.wearCount),
        wearCount: wearCount + userInfo.wearCount
    };

    return { [userPath]: Object.assign({}, user, updateInfo) };
};

const updateRoom = (store, room, user) => {

    const roomPath = `/shops/${store}/rooms/${room}`;
    return {
        [roomPath]: {
            occupied: user ? true : false,
            timestamp: user ? Date.now() : null,
            user: user || null
        }
    };
};

const updateStore = (storeInfo, roomInfo) => {

    const { timestamp, user } = roomInfo;
    // If there was nobody on the room it means that it has just been occupied
    if (!user) {
        return {};
    }
    const { id, amountTimeSpent, wearCount = 0, wearAvg = 0 } = storeInfo;
    const storePath = `/shops/${id}`;
    const timeSpent = Date.now() - timestamp;

    return {
        [`${storePath}/wearAvg`]: ((wearCount * wearAvg) + timeSpent) / (wearCount + user.wearCount),
        [`${storePath}/wearCount`]: wearCount + user.wearCount,
        [`${storePath}/amountTimeSpent`]: amountTimeSpent + timeSpent

    };

};

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
                    user: Joi.object().keys({
                        name: Joi.string().example('Daniel'),
                        userId: Joi.string().example('oRtocJAgGDa8VIdo15g1zRLmnxL2'),
                        wearCount: Joi.number().integer().positive().default(3),
                        wearAvg: Joi.number().integer().positive(),
                        timestamp: Joi.date().timestamp('javascript').raw().default(Date.now, 'When the user entered the queue')
                    }).optional()
                }
            },
            description: 'Updates the state of a room',
            async handler(request, reply) {

                const { store, room } = request.params;
                const { user } = request.payload;
                const storeRef = db.ref(`/shops/${store}`);
                const storeData = await storeRef.once('value');

                const currentState = storeData.val().rooms[room];

                if (!currentState) {
                    return reply(Boom.notFound(`The room ${room} does not exists at ${store} store`));
                }

                const updatedUser = await updateUser(currentState.user, currentState);
                const updatedRoom = updateRoom(store, room, user);
                const updatedStore = updateStore(storeData.val(), currentState);

                const updates = Object.assign({}, updatedUser, updatedRoom, updatedStore);

                try {
                    await db.ref().update(updates);
                    return reply({ status: 200 });
                }
                catch (err) {
                    console.error(err.name, err.message);
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
