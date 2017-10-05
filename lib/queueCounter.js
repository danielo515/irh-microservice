'use strict';

const Db = require('./firebaseDB');

const inc = (curr) => (curr || 0) + 1;
const compose = (...funcs) => (x) => funcs.reduceRight((acc, fn) => fn(acc), x);
const getVal = (snap) => snap.val();
const get = (prop) => (o) => o[prop];
//eslint-disable-next-line
const trace = (message, method = 'log') => (x) => {

    console[method](message, x);
    return x;
};

const listen = () => {

    const queues = Db.ref('/queues');
    const shops = Db.ref('/shops');

    //eslint-disable-next-line
    const setUserTurn = (queue) => (userKey) => (turn) => {

        return queue.child(userKey).child('turn').transaction(() => turn);
    };

    queues.on('child_added',
        (queueRef) => {

            const shopName = queueRef.key;
            const queue = queues.child(shopName);
            const setUserTurnInQueue = setUserTurn(queue);
            queue.on('child_added', (userSnap) => {

                const user = userSnap.val();
                if (user.turn !== undefined) {
                    return;
                }

                shops.child(shopName)
                    .child('count')
                    .transaction(inc)
                    .then(compose(setUserTurnInQueue(userSnap.key), getVal, get('snapshot')))
                    .then(trace(`User ${user.name} on queue ${shopName} updated`));
            });
        });
};

listen();