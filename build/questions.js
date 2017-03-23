"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Questions = function () {
  function Questions(store) {
    _classCallCheck(this, Questions);

    this.store = store;
    this.questionTimeout = null;
    this.timerCount = 30;
  }

  _createClass(Questions, [{
    key: "shuffle",
    value: function shuffle(str) {
      var a = str.split(""),
          n = a.length;

      for (var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
      return a.join("");
    }
  }, {
    key: "randomize",
    value: function randomize() {
      var state = this.store.getState();
      var randInt = Math.floor(Math.random() * state.questions.length);
      var activeQuestion = _extends({}, state.questions[randInt], {
        randomAnswer: this.shuffle(state.questions[randInt].answer)
      });
      return activeQuestion;
    }
  }, {
    key: "start",
    value: function start() {
      var _this = this;

      var store = this.store;
      if (!this.questionTimeout) {
        console.log('START QUESTION TIMEOUT');
        this.questionTimeout = setInterval(function () {
          var state = store.getState();
          var nextTimer = state.timer - 1;
          if (nextTimer < 0) {
            nextTimer = _this.timerCount;
            store.dispatch({
              type: 'CHANGE_ACTIVE_QUESTION',
              payload: {
                activeQuestion: _this.randomize()
              }
            });
          }
          store.dispatch({
            type: 'TICK_TIMER',
            payload: {
              timer: nextTimer
            }
          });
        }, 1000);
      }
    }
  }, {
    key: "getTimer",
    value: function getTimer() {
      var store = this.store;
      var state = store.getState();
      return state.timer;
    }
  }, {
    key: "checkAnswer",
    value: function checkAnswer(_ref) {
      var answerText = _ref.answerText,
          lineId = _ref.lineId;

      var store = this.store;
      var state = store.getState();
      var currentUser = state.users[lineId];
      if (!currentUser || !currentUser.activeRoomId) {
        return;
      }
      var roomId = currentUser.activeRoomId;
      console.log(state.users);
      console.log('CHECK ANSWER', state.activeQuestion);

      var correctCounter = state.activeQuestion.correctCounter;
      var answer = {
        text: answerText,
        addedScore: 0
      };

      var myCurrentAnswer = state.answers.filter(function (answer) {
        return answer.lineId == lineId && answer.answerState;
      });

      if (myCurrentAnswer.length > 0) return;
      if (!state.activeQuestion.answer) {
        return;
      }
      if (state.activeQuestion.answer.toLowerCase() == answerText.toLowerCase()) {
        correctCounter++;
        switch (correctCounter) {
          case 1:
            answer.addedScore = 10;
            break;
          case 2:
            answer.addedScore = 5;
            break;
          case 3:
          case 4:
          case 5:
            answer.addedScore = 1;
            break;
        }
        currentUser.score += answer.addedScore;
        answer.state = true;
      } else {
        answer.state = false;
      }
      store.dispatch({
        type: 'ANSWER',
        payload: {
          answer: answer,
          user: currentUser,
          roomId: roomId,
          correctCounter: correctCounter
        }
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      clearInterval(this.questionTimeout);
      this.questionTimeout = null;
    }
  }]);

  return Questions;
}();

// > Ibukota negara Indonesia
// > SAIDONNIA

// > A: Indonesa
//  salah
// > B: Indonesia
//  B + 10
// > A: Indonesia
//  A + 5
// > C: Indonesia
//  C + 1
// > D: Indonesia
//  D + 1
// > E: Indonesia
//  D + 1
// > F: Indonesia
//  F + 0

// ---

// > A menjawab salah
// > B menjawab benar + 10
// > A menjawab Indonesia + 1
// > C menjawab Indonesia + 1


// High score sementara
// - B:


// - Menu Utama
//   > minta nickname

//   - start
//     > muncul pertanyaan
//     > lawan semua yang online

//   - duel
//     > nickname musuh
//       > musuh dapet message duel (timeout 30 detik)
//         > accept
//           > muncul pertanyaan

//   - score
//     > High score
//     > score dia skr


exports.default = Questions;