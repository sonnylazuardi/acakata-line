'use strict';

var _rooms = require('./rooms');

var _rooms2 = _interopRequireDefault(_rooms);

var _questions = require('./questions');

var _questions2 = _interopRequireDefault(_questions);

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serviceAccount = require("./firebase");
_firebaseAdmin2.default.initializeApp({
  credential: _firebaseAdmin2.default.credential.cert(serviceAccount),
  databaseURL: "https://acakkata-12bf7.firebaseio.com"
});
var database = _firebaseAdmin2.default.database();
var Bot = require('node-line-messaging-api');
var ID = '1506324098';
var SECRET = '67cdf8ca5562c3b558c66d88115762c7';
var TOKEN = 'qP7mjb0JygPTaztahWWNdv+3x1oQEcYAk3jAcORqe7Ictlfza8qCuG8eTb2VAfppXhh73MG3gAAuW42/SCGoyjB3N/9NFsSe6rh0I0xM9WAEVvTnKqIPXIXtOn9UbGIoQIqvEg12mQ39tQ+o+Y3n6gdB04t89/1O/w1cDnyilFU=';

var PORT = process.env.PORT || 3002;
var bot = new Bot({
  secret: SECRET,
  token: TOKEN,
  options: {
    port: PORT,
    tunnel: false,
    verifySignature: true
  }
});

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

bot.on('webhook', function (_ref) {
  var port = _ref.port,
      endpoint = _ref.endpoint;

  console.log('bot listens on port ' + port + '.');
});

bot.on('follow', function (_ref2) {
  var replyToken = _ref2.replyToken,
      source = _ref2.source;

  bot.getProfile(source[source.type + 'Id']).then(function (_ref3) {
    var displayName = _ref3.data.displayName;

    bot.replyMessage(replyToken, new Messages().addText('Selamat Datang di AcaKata, ' + displayName + '!').addText({ text: 'Main acakata seru dan menyenangkan (>.<) \n ' }).commit());
  });
});

bot.on('text', function (_ref4) {
  var replyToken = _ref4.replyToken,
      source = _ref4.source,
      type = _ref4.source.type,
      text = _ref4.message.text;

  if (text == '/join') {
    room.createRoom('test');

    bot.getProfile(source[source.type + 'Id']).then(function (_ref5) {
      var displayName = _ref5.data.displayName;

      room.addUser({ lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: 'test' });
      room.syncReducer({ database: database, user: source, roomId: 'test' });
      room.onlineUser({ roomId: 'test', callback: function callback(_ref6) {
          var users = _ref6.users;

          if (users.length > 20) {
            bot.pushMessage(source.userId, new Bot.Messages().addText('Online User: \n\n ' + users.length + ' users').commit());
          } else {
            bot.pushMessage(source.userId, new Bot.Messages().addText('Online User: \n\n ' + users.map(function (user) {
              return '' + user.displayName;
            }).join('\n')).commit());
          }
        } });
    });
  } else if (text == '/start') {
    questions.start();
    var timer = questions.getTimer();
    bot.pushMessage(source.userId, new Bot.Messages().addText('Pertanyaan berikutnya akan muncul dalam ' + timer + ' detik').commit());
  } else if (text == '/highscore') {
    room.listHighscore({ roomId: 'test', callback: function callback(_ref7) {
        var user = _ref7.user,
            highscores = _ref7.highscores;

        bot.pushMessage(user.lineId, new Bot.Messages().addText('Highscore: \n\n ' + highscores.map(function (user) {
          return user.displayName + ' = ' + user.score;
        }).join('\n')).commit());
      } });
  } else if (text == '/exit') {
    room.syncScore({ database: database, lineId: source.userId, roomId: 'test' });
    room.removeUser({ lineId: source.userId, roomId: 'test' });
  } else if (room.checkUserExist({ roomId: 'test', lineId: source.userId })) {
    var answerText = text;
    questions.checkAnswer({ answerText: answerText, lineId: source.userId, roomId: 'test' });
  }
});