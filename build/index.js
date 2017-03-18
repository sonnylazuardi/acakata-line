'use strict';

var _rooms = require('./rooms');

var _rooms2 = _interopRequireDefault(_rooms);

var _questions = require('./questions');

var _questions2 = _interopRequireDefault(_questions);

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventEmitter = require('eventemitter3');

var Bot = require('node-line-messaging-api');
var ID = '1501455661';
var SECRET = '367d38f1f36d2b9c3de59437a88ddd23';
var TOKEN = '8Rn/qNeXALta5QAW9d/bSeT4qGsdSTH8VF3d+GFIARxEPOoTC+Sl0+3KdIVLXXOUelUDlxociqtljNPP3py59QH9ECwZbd3AvWBTC2IAHYEZDpYm3QhZE+m6+/aUYQPU18WXCFZ+XTZocY6FcCmp3QdB04t89/1O/w1cDnyilFU=';

var PORT = process.env.PORT || 3002;
var bot = new Bot(SECRET, TOKEN, { webhook: { port: PORT, ngrok: false } });

var store = (0, _redux.createStore)(_reducers2.default);
var questions = new _questions2.default(store);
var room = new _rooms2.default(store);

var questionId = null;
var answersLength = 0;

store.subscribe(function () {
  var state = store.getState();
  if (questionId !== state.questionId) {
    questionId = state.questionId;
    var pertanyaan = state.activeQuestion.question;
    var randomAnswer = state.activeQuestion.randomAnswer;

    room.broadCast({ roomId: 'test', callback: function callback(user) {
        bot.pushMessage(user.lineId, new Bot.Messages().addText('Pertanyaan: ' + pertanyaan + ' \n\n ' + randomAnswer).commit());
      } });
  }

  if (state.answers.length != answersLength) {
    answersLength = state.answers.length;
    room.broadCast({ roomId: 'test', callback: function callback(user) {
        var lastAnswer = state.answers[answersLength - 1];
        if (lastAnswer) {
          if (lastAnswer.answerState) {
            if (lastAnswer.addedScore == 10) {
              bot.pushMessage(user.lineId, new Bot.Messages().addText(lastAnswer.displayName + ' menjawab dengan benar (+10)').commit());
            } else if (lastAnswer.addedScore == 5) {
              bot.pushMessage(user.lineId, new Bot.Messages().addText(lastAnswer.displayName + ' menjawab ' + lastAnswer.answerText + ' (+5)').commit());
            } else {
              bot.pushMessage(user.lineId, new Bot.Messages().addText(lastAnswer.displayName + ' menjawab benar (+1)').commit());
            }
          } else {
            bot.pushMessage(user.lineId, new Bot.Messages().addText(lastAnswer.displayName + ' menjawab salah').commit());
          }
        }
      } });
  }
});

bot.on('webhook', function (w) {
  console.log('bot listens on port ' + w + '.');
});

bot.on('follow', function (_ref) {
  var replyToken = _ref.replyToken,
      source = _ref.source;

  bot.getProfile(source[source.type + 'Id']).then(function (_ref2) {
    var displayName = _ref2.data.displayName;

    bot.replyMessage(replyToken, new Messages().addText('Selamat Datang di AcaKata, ' + displayName + '!').addText({ text: 'Main acakata seru dan menyenangkan (>.<) \n ' }).commit());
  });
});

bot.on('text', function (_ref3) {
  var replyToken = _ref3.replyToken,
      source = _ref3.source,
      type = _ref3.source.type,
      text = _ref3.message.text;

  if (text == '/join') {
    room.createRoom('test');
    bot.getProfile(source[source.type + 'Id']).then(function (_ref4) {
      var displayName = _ref4.data.displayName;

      console.log(displayName);
      room.addUser({ lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: 'test' });
    });
  } else if (text == '/start') {
    questions.start();
    var timer = questions.getTimer();
    bot.pushMessage(source.userId, new Bot.Messages().addText('Pertanyaan berikutnya akan muncul dalam ' + timer + ' detik').commit());
  } else if (text.indexOf('/jawab ') != -1) {
    var answerSplit = text.split('/jawab ');
    var answerText = answerSplit[1];
    questions.checkAnswer({ answerText: answerText, lineId: source.userId, roomId: 'test' });
  } else if (text == '/highscore') {
    room.listHighscore({ roomId: 'test', callback: function callback(_ref5) {
        var user = _ref5.user,
            highscores = _ref5.highscores;

        bot.pushMessage(user.lineId, new Bot.Messages().addText('Highscore: \n\n ' + highscores.map(function (user) {
          return user.displayName + ' = ' + user.score;
        }).join('\n')).commit());
      } });
  } else if (text == '/exit') {
    room.removeUser({ lineId: source.userId, roomId: 'test' });
  }
});