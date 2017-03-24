'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _reselect = require('reselect');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var usersSelector = function usersSelector(state) {
  return state.users;
};
var roomsSelector = function roomsSelector(state) {
  return state.rooms;
};
var roomUserSelector = (0, _reselect.createSelector)(usersSelector, roomsSelector, function (users, rooms) {
  var detailRooms = {};
  Object.keys(rooms).forEach(function (roomId) {
    detailRooms[roomId] = {};
    Object.keys(rooms[roomId]).forEach(function (userId) {
      detailRooms[roomId][userId] = users[userId];
    });
  });
  return detailRooms;
});

var Rooms = function () {
  function Rooms(store) {
    _classCallCheck(this, Rooms);

    this.store = store;
  }

  _createClass(Rooms, [{
    key: 'createRoom',
    value: function createRoom(roomId) {
      var store = this.store;
      store.dispatch({
        type: 'CREATE_ROOM',
        payload: {
          roomId: roomId
        }
      });
    }
  }, {
    key: 'addUser',
    value: function addUser(_ref) {
      var lineId = _ref.lineId,
          replyToken = _ref.replyToken,
          roomId = _ref.roomId,
          displayName = _ref.displayName,
          pictureUrl = _ref.pictureUrl;

      var store = this.store;
      store.dispatch({
        type: 'ADD_USER',
        payload: {
          user: {
            lineId: lineId,
            replyToken: replyToken,
            roomId: roomId,
            displayName: displayName,
            pictureUrl: pictureUrl
          }
        }
      });
    }
  }, {
    key: 'addUserFollow',
    value: function addUserFollow(_ref2) {
      var lineId = _ref2.lineId,
          displayName = _ref2.displayName,
          pictureUrl = _ref2.pictureUrl;

      var store = this.store;
      store.dispatch({
        type: 'ADD_USER_FOLLOW',
        payload: {
          user: {
            lineId: lineId,
            displayName: displayName,
            pictureUrl: pictureUrl
          }
        }
      });
    }
  }, {
    key: 'removeUser',
    value: function removeUser(_ref3) {
      var lineId = _ref3.lineId;

      var store = this.store;
      store.dispatch({
        type: 'REMOVE_USER',
        payload: {
          user: {
            lineId: lineId
          }
        }
      });
    }
  }, {
    key: 'extendTime',
    value: function extendTime(_ref4) {
      var lineId = _ref4.lineId;

      var store = this.store;
      store.dispatch({
        type: 'EXTEND_TIME',
        payload: {
          user: {
            lineId: lineId
          }
        }
      });
    }
  }, {
    key: 'broadCastAll',
    value: function broadCastAll(callback) {
      var state = this.store.getState();
      Object.keys(state.rooms || {}).forEach(function (roomId) {
        Object.keys(state.rooms[roomId] || {}).forEach(function (key) {
          var user = state.rooms[roomId][key];
          callback(user);
        });
      });
    }
  }, {
    key: 'requestDuel',
    value: function requestDuel(_ref5) {
      var displayName = _ref5.displayName,
          callback = _ref5.callback;

      var state = this.store.getState();
      var users = [];
      Object.keys(state.users || {}).forEach(function (userId) {
        var user = state.users[userId];
        users.push(user);
      });

      var userTarget = users.filter(function (user) {
        return user.displayName == displayName;
      })[0];
      if (userTarget) {
        callback(userTarget);
      }
    }
  }, {
    key: 'broadCast',
    value: function broadCast(_ref6) {
      var roomId = _ref6.roomId,
          callback = _ref6.callback;

      var state = this.store.getState();
      Object.keys(state.rooms[roomId] || {}).forEach(function (key) {
        var user = state.rooms[roomId][key];
        callback(user);
      });
    }
  }, {
    key: 'broadCastUsers',
    value: function broadCastUsers(callback) {
      var state = this.store.getState();
      Object.keys(state.users || {}).forEach(function (userId) {
        var user = state.users[userId];
        callback(user);
      });
    }
  }, {
    key: 'checkUserActive',
    value: function checkUserActive(callback) {
      var state = this.store.getState();
      Object.keys(state.users).forEach(function (userId) {
        var user = state.users[userId];
        if (!user.activeRoomId) return;
        var timeDiff = (Date.now() - user.lastAnswerTime) / 1000 / 60;
        if (timeDiff > 1) {
          callback(user);
        }
      });
    }
  }, {
    key: 'broadCastAnswerState',
    value: function broadCastAnswerState(callback) {
      var state = this.store.getState();
      Object.keys(state.rooms || {}).forEach(function (roomId) {
        Object.keys(state.rooms[roomId] || {}).forEach(function (key) {
          var user = state.rooms[roomId][key];
          var answerByUser = state.answers.filter(function (answer) {
            return answer.lineId == user.lineId;
          });
          var correctAnswerByUser = state.answers.filter(function (answer) {
            return answer.lineId == user.lineId && answer.answerState;
          })[0];

          // only show answer state after answering the first question
          if (answerByUser.length > 0) {
            if (correctAnswerByUser) {
              callback({ user: user, answerState: true, position: correctAnswerByUser.position });
            } else {
              callback({ user: user, answerState: false, position: 0 });
            }
          }
        });
      });
    }
  }, {
    key: 'listHighscore',
    value: function listHighscore(_ref7) {
      var userId = _ref7.userId,
          callback = _ref7.callback;

      var state = this.store.getState();
      var highscores = Object.keys(state.users).map(function (key) {
        return state.users[key];
      }).sort(function (a, b) {
        return b.score - a.score;
      });
      callback({ user: { lineId: userId }, highscores: highscores });
    }
  }, {
    key: 'onlineUser',
    value: function onlineUser(_ref8) {
      var roomId = _ref8.roomId,
          callback = _ref8.callback;

      var state = this.store.getState();
      var detailRooms = roomUserSelector(state);
      var users = Object.keys(detailRooms[roomId]).map(function (key) {
        var user = detailRooms[roomId][key];
        return user;
      });
      callback({ users: users });
    }
  }, {
    key: 'checkUserExist',
    value: function checkUserExist(_ref9) {
      var lineId = _ref9.lineId;

      var state = this.store.getState();

      return state.users[lineId] && state.users[lineId].activeRoomId;
    }
  }, {
    key: 'syncScore',
    value: function syncScore(_ref10) {
      var database = _ref10.database;

      var state = this.store.getState();
      var user = state.users;
      var env = process.env.NODE_ENV || 'development';
      if (Object.keys(user || {}).length > 0) {
        if (env == 'production') {
          database.ref('users/').set(user);
          _axios2.default.put('https://acakkatascore.firebaseio.com/scores.json', user, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          database.ref('userbaru/').set(user);
          _axios2.default.put('https://acakkatascore.firebaseio.com/scorebaru.json', user, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      }
    }
  }, {
    key: 'syncReducer',
    value: function syncReducer(_ref11) {
      var database = _ref11.database;

      var store = this.store;
      var state = store.getState();
      var result = null;

      var env = process.env.NODE_ENV || 'development';
      if (env == 'production') {
        database.ref('users').once('value').then(function (snapshot) {
          result = snapshot.val();
          if (result) {
            store.dispatch({
              type: 'SYNC',
              payload: {
                users: result
              }
            });
          }
        });
      } else {
        database.ref('userbaru').once('value').then(function (snapshot) {
          result = snapshot.val();
          if (result) {
            store.dispatch({
              type: 'SYNC',
              payload: {
                users: result
              }
            });
          }
        });
      }
    }
  }]);

  return Rooms;
}();

exports.default = Rooms;