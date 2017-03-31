'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

try {
  _firebase2.default.initializeApp({
    databaseURL: 'https://acakkatascore.firebaseio.com/'
  });
} catch (err) {
  // we skip the "already exists" message which is
  // not an actual error when we're hot-reloading
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack);
  }
}

var db = _firebase2.default.database();
exports.default = db;