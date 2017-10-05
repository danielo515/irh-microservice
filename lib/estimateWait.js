'use strict';

const Db = require('./firebaseDB');

const trace = (message, method = 'log') =>

    (...args) => {

        console[method].apply(console, [message].concat(args));
        return args[0];
    };

const msToMin = (ts) => (ts / 1000 / 60) + 'min';

const computeWaitTime = (snapshot) => {

    const waitTimes = [];

    snapshot.forEach((queue) => {

        const storeName = queue.key;
        queue = Object.values(queue.val());
        const waitTime = queue.reduce((acc, { wearAvg, wearCount }) => ((wearAvg * wearCount) + acc), 0);
        console.info(`waitTime for ${storeName}: ${msToMin(waitTime)}`);
        waitTimes.push({ store: storeName, waitTime });
    });

    return waitTimes;
};

const updateStoresWaitTime = (snapshot) => {

    const waitTimes = computeWaitTime(snapshot);
    const atomicUpdate = waitTimes.reduce((query, { store, waitTime }) =>

        Object.assign({}, query, { [`/shops/${store}/estimatedWaitTime`]: waitTime })
        , {});

    Db.ref().update(atomicUpdate)
        .then(trace('Stores wait time updated succesfully', 'info'))
        .catch(trace('An error ocurred updating the stores estimated wait time', 'error'));
};

Db.ref('/queues').on('value', updateStoresWaitTime);
