'use strict';
const Firebase = require('firebase');
const FbConfig = require('../config/firebase.json');
const db = Firebase.initializeApp(FbConfig, 'daemon').database();

module.exports = db;
