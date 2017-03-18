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
  }]);

  return Rooms;
}();

exports.default = Rooms;