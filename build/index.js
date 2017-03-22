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
var currentUsers = null;

room.syncReducer({ database: database });

store.subscribe(function () {
  var state = store.getState();

  if (currentUsers != state.users) {
    currentUsers = state.users;
    room.syncScore({ database: database });
  }

  if (questionId !== state.questionId) {
    questionId = state.questionId;
    var pertanyaan = state.activeQuestion.question;
    var randomAnswer = state.activeQuestion.randomAnswer;

    room.broadCastAll(function (user) {
      bot.pushMessage(user.lineId, new Bot.Messages().addText('Petunjuk: ' + pertanyaan + ' \n\n ' + randomAnswer).commit());
    });
  }

  if (state.answers.length != answersLength) {
    answersLength = state.answers.length;
    var lastAnswer = state.answers[answersLength - 1];
    console.log(lastAnswer);
    if (lastAnswer) {
      room.broadCast({ roomId: lastAnswer.roomId, callback: function callback(user) {
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
      });
    }
  }
});

bot.on('webhook', function (_ref) {
  var port = _ref.port,
      endpoint = _ref.endpoint;

  console.log('bot listens on port ' + port + '.');
});

bot.on('follow', function (event) {
  bot.getProfileFromEvent(event).then(function (_ref2) {
    var displayName = _ref2.displayName;

    console.log(event.replyToken, displayName);
    bot.replyMessage(event.replyToken, new Bot.Messages().addText('Halo ' + displayName + '! Kenalin aku bot acakata. Kita bisa main tebak tebakan kata multiplayer loh sama teman-teman lain yang lagi online.\n\nCara mainnya gampang, kita tinggal cepet-cepetan menebak dari petunjuk dan kata yang diacak. Semakin cepat kita menebak benar maka score yang kita dapat semakin tinggi. Serunya, kita bertanding sama semua orang yang lagi main online juga!').addSticker({ packageId: 1, stickerId: 406 })
    // .addButtons({
    //   thumbnailImageUrl: 'https://firebasestorage.googleapis.com/v0/b/memeline-76501.appspot.com/o/acakatacover.png?alt=media&token=85134e75-bdc7-4747-9590-1915b79baf0a',
    //   altText: '',
    //   title: 'Acakata Menu',
    //   text: 'Mau mulai main?',
    //   // actions: [
    //   //   {
    //   //     type: 'message',
    //   //     label: 'Mulai Battle',
    //   //     text: '/battle'
    //   //   },
    //   //   {
    //   //     type: 'message',
    //   //     label: 'Cara Bermain',
    //   //     text: '/help'
    //   //   },
    //   // ]
    // })
    .commit());
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
      var displayName = _ref4.displayName;

      room.addUser({ lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: 'test' });

      room.onlineUser({ roomId: 'test', callback: function callback(_ref5) {
          var users = _ref5.users;

          if (users.length > 20) {
            bot.pushMessage(source.userId, new Bot.Messages().addText('Online User: \n\n ' + users.length + ' users').commit());
          } else {
            bot.pushMessage(source.userId, new Bot.Messages().addText('Online User: \n\n ' + users.map(function (user) {
              return '' + user.displayName;
            }).join('\n')).commit());
          }
        } });
    });
  } else if (text.indexOf('/duel') > -1) {
    var nameUser = text.split(' ')[1];
    bot.getProfile(source[source.type + 'Id']).then(function (_ref6) {
      var displayName = _ref6.displayName;

      var arrayName = [nameUser, displayName].sort();
      room.createRoom(arrayName[0] + '-' + arrayName[1]);
      console.log(arrayName[0] + '-' + arrayName[1]);
      room.addUser({ lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: arrayName[0] + '-' + arrayName[1] });

      room.onlineUser({ roomId: arrayName[0] + '-' + arrayName[1], callback: function callback(_ref7) {
          var users = _ref7.users;

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
    room.createRoom('test');
    questions.start();
    var timer = questions.getTimer();
    bot.pushMessage(source.userId, new Bot.Messages().addText('Pertanyaan berikutnya akan muncul dalam ' + timer + ' detik').commit());
  } else if (text == '/highscore') {
    room.listHighscore({ userId: source.userId, callback: function callback(_ref8) {
        var user = _ref8.user,
            highscores = _ref8.highscores;

        bot.pushMessage(user.lineId, new Bot.Messages().addText('Highscore: \n\n ' + highscores.map(function (user) {
          return user.displayName + ' = ' + user.score;
        }).join('\n')).commit());
      } });
  } else if (text == '/exit') {
    room.removeUser({ lineId: source.userId });
  } else if (room.checkUserExist({ lineId: source.userId })) {
    var answerText = text;

    questions.checkAnswer({ answerText: answerText, lineId: source.userId });
  }
});