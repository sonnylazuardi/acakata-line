'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
          displayName = _ref.displayName;

      var store = this.store;
      store.dispatch({
        type: 'ADD_USER',
        payload: {
          user: {
            lineId: lineId,
            replyToken: replyToken,
            roomId: roomId,
            displayName: displayName
          }
        }
      });
    }

    // deleteRooms({ roomName }) {
    //   delete this.rooms[roomName]
    // }

    // checkUserExist(roomName, id) {
    //   return this.rooms[roomName].hasOwnProperty(id)
    // }

  }, {
    key: 'removeUser',
    value: function removeUser(_ref2) {
      var lineId = _ref2.lineId,
          roomId = _ref2.roomId;

      var store = this.store;
      store.dispatch({
        type: 'REMOVE_USER',
        payload: {
          user: {
            lineId: lineId,
            roomId: roomId
          }
        }
      });
    }
  }, {
    key: 'broadCast',
    value: function broadCast(_ref3) {
      var roomId = _ref3.roomId,
          callback = _ref3.callback;

      var state = this.store.getState();
      Object.keys(state.rooms[roomId]).forEach(function (key) {
        var user = state.rooms[roomId][key];
        callback(user);
      });
    }
  }, {
    key: 'listHighscore',
    value: function listHighscore(_ref4) {
      var roomId = _ref4.roomId,
          callback = _ref4.callback;

      var state = this.store.getState();
      var highscores = Object.keys(state.rooms[roomId]).map(function (key) {
        var user = state.rooms[roomId][key];
        return user;
      }).sort(function (a, b) {
        return b.score - a.score;
      });

      Object.keys(state.rooms[roomId]).forEach(function (key) {
        var user = state.rooms[roomId][key];
        callback({ user: user, highscores: highscores });
      });
    }
  }, {
    key: 'onlineUser',
    value: function onlineUser(_ref5) {
      var roomId = _ref5.roomId,
          callback = _ref5.callback;

      var state = this.store.getState();
      var users = Object.keys(state.rooms[roomId]).map(function (key) {
        var user = state.rooms[roomId][key];
        return user;
      });
      callback({ users: users });
    }
  }, {
    key: 'checkUserExist',
    value: function checkUserExist(_ref6) {
      var roomId = _ref6.roomId,
          lineId = _ref6.lineId;

      var state = this.store.getState();
      return !!state.rooms[roomId] && !!state.rooms[roomId][lineId];
    }
  }, {
    key: 'syncScore',
    value: function syncScore(_ref7) {
      var database = _ref7.database,
          lineId = _ref7.lineId,
          roomId = _ref7.roomId;

      var state = this.store.getState();
      var user = state.rooms[roomId][lineId];
      database.ref('users/' + lineId).set({
        score: user.score,
        lineId: user.lineId,
        displayName: user.displayName,
        replyToken: user.replyToken
      });
    }
  }, {
    key: 'syncReducer',
    value: function syncReducer(_ref8) {
      var database = _ref8.database,
          user = _ref8.user,
          roomId = _ref8.roomId;

      var store = this.store;
      var state = store.getState();
      var result = null;
      database.ref('users/' + user.userId).once('value').then(function (snapshot) {
        result = snapshot.val();
        if (result) {
          store.dispatch({
            type: 'SYNC',
            payload: {
              user: {
                lineId: result.lineId,
                replyToken: result.replyToken,
                score: result.score,
                roomId: roomId,
                displayName: result.displayName
              }
            }
          });
        }
      });
    }
  }]);

  return Rooms;
}();

exports.default = Rooms;