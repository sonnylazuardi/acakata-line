'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _user2 = require('./user.js');

var _user3 = _interopRequireDefault(_user2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateScore(lineId, displayName, score) {
  _user3.default.findOne({ 'lineId': lineId }).then(function (user) {
    if (user) {
      user.score = score;
    } else {
      var _user = (0, _user3.default)({
        lineId: lineId,
        displayName: displayName,
        score: score
      });
    }
    user.saveAsync();
  });
}

function getScore(lineId) {
  _user3.default.findOne({ lineId: lineId }).then(function (user) {

    return user.score;
  });
}

exports.default = { updateScore: updateScore, getScore: getScore };