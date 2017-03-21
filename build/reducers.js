'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = questions;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _questionList = require('./questionList');

var _questionList2 = _interopRequireDefault(_questionList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = {
  questions: _questionList2.default,
  timer: 5,
  activeQuestion: {
    correctCounter: 0
  },
  rooms: {},
  answers: []
};

function questions() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];
  var payload = action.payload;

  switch (action.type) {
    case 'TICK_TIMER':
      return _extends({}, state, {
        timer: payload.timer
      });
    case 'CHANGE_ACTIVE_QUESTION':
      return _extends({}, state, {
        activeQuestion: _extends({}, payload.activeQuestion, {
          correctCounter: 0
        }),
        questionId: _uuid2.default.v4(),
        answers: []
      });
    case 'CREATE_ROOM':
      return _extends({}, state, {
        rooms: state.rooms.hasOwnProperty(payload.roomId) ? state.rooms : _extends({}, state.rooms, _defineProperty({}, payload.roomId, {}))
      });
    case 'ANSWER':
      return _extends({}, state, {
        activeQuestion: _extends({}, state.activeQuestion, {
          correctCounter: payload.correctCounter
        }),
        answers: [].concat(_toConsumableArray(state.answers), [{
          lineId: payload.user.lineId,
          displayName: payload.user.displayName,
          addedScore: payload.answer.addedScore,
          answerText: payload.answer.text,
          answerState: payload.answer.state
        }]),
        rooms: _extends({}, state.rooms, _defineProperty({}, payload.user.roomId, _extends({}, state.rooms[payload.user.roomId], _defineProperty({}, payload.user.lineId, {
          score: payload.user.score
        }))))
      });
    case 'REMOVE_USER':
      var updateRoom = Object.keys(state.rooms[payload.user.roomId]).filter(function (key) {
        return key != payload.user.lineId;
      }).reduce(function (acc, key) {
        return _extends({}, acc, _defineProperty({}, key, state.rooms[payload.user.roomId][key]));
      }, {});
      var newState = _extends({}, state, {
        rooms: _extends({}, state.rooms, _defineProperty({}, payload.user.roomId, updateRoom))
      });
      return newState;
    case 'ADD_USER':
      var updateRoom = _extends({}, state.rooms[payload.user.roomId], _defineProperty({}, payload.user.lineId, {
        lineId: payload.user.lineId,
        replyToken: payload.user.replyToken,
        score: 0,
        displayName: payload.user.displayName
      }));
      var newState = _extends({}, state, {
        rooms: _extends({}, state.rooms, _defineProperty({}, payload.user.roomId, updateRoom))
      });
      return newState;
    case 'SYNC':
      var updateRoom = _extends({}, state.rooms[payload.user.roomId], _defineProperty({}, payload.user.lineId, {
        lineId: payload.user.lineId,
        replyToken: payload.user.replyToken,
        score: payload.user.score,
        displayName: payload.user.displayName
      }));

      var newState = _extends({}, state, {
        rooms: _extends({}, state.rooms, _defineProperty({}, payload.user.roomId, updateRoom))
      });
      console.log(newState.rooms.test);
      return newState;
    default:
      return state;
  }
}