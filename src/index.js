import Rooms from './rooms'
import Questions from './questions';

import firebase from 'firebase-admin';

var serviceAccount = require("./firebase");
firebase.initializeApp(
  {
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://acakkata-12bf7.firebaseio.com"
  }
);
var database = firebase.database();

const EventEmitter = require('eventemitter3')

const Bot = require('node-line-messaging-api');
const ID = `1506324098`
const SECRET = `67cdf8ca5562c3b558c66d88115762c7`
const TOKEN = `qP7mjb0JygPTaztahWWNdv+3x1oQEcYAk3jAcORqe7Ictlfza8qCuG8eTb2VAfppXhh73MG3gAAuW42/SCGoyjB3N/9NFsSe6rh0I0xM9WAEVvTnKqIPXIXtOn9UbGIoQIqvEg12mQ39tQ+o+Y3n6gdB04t89/1O/w1cDnyilFU=`

const PORT = process.env.PORT || 3002
const bot = new Bot(SECRET, TOKEN, { webhook: { port: PORT, ngrok: false } });

import reducers from './reducers';
import {createStore} from 'redux';

const store = createStore(reducers);
const questions = new Questions(store);
const room = new Rooms(store);

let questionId = null;
let answersLength = 0;

store.subscribe(() => {
  const state = store.getState();
  if (questionId !== state.questionId) {
    questionId = state.questionId;
    const pertanyaan = state.activeQuestion.question;
    const randomAnswer = state.activeQuestion.randomAnswer;

    room.broadCast({roomId: 'test', callback: (user) => {
      bot.pushMessage(user.lineId, new Bot.Messages().addText(`Pertanyaan: ${pertanyaan} \n\n ${randomAnswer}`).commit());
    }});
  }

  if (state.answers.length != answersLength) {
    answersLength = state.answers.length;
    room.broadCast({roomId: 'test', callback: (user) => {
      const lastAnswer = state.answers[answersLength - 1];
      if (lastAnswer) {
        if (lastAnswer.answerState) {
          if (lastAnswer.addedScore == 10) {
            bot.pushMessage(user.lineId, new Bot.Messages().addText(`${lastAnswer.displayName} menjawab dengan benar (+10)`).commit());
          } else if (lastAnswer.addedScore == 5) {
            bot.pushMessage(user.lineId, new Bot.Messages().addText(`${lastAnswer.displayName} menjawab ${lastAnswer.answerText} (+5)`).commit());
          } else {
            bot.pushMessage(user.lineId, new Bot.Messages().addText(`${lastAnswer.displayName} menjawab benar (+1)`).commit());
          }
        } else {
          bot.pushMessage(user.lineId, new Bot.Messages().addText(`${lastAnswer.displayName} menjawab salah`).commit());
        }
      }
    }});
  }
})

bot.on('webhook', w => {
  console.log(`bot listens on port ${w}.`)
})

bot.on('follow', ({replyToken, source}) => {
  bot.getProfile(source[`${source.type}Id`]).then(({data: {displayName}}) => {
    bot.replyMessage(replyToken, new Messages().addText(`Selamat Datang di AcaKata, ${displayName}!`).addText({text: 'Main acakata seru dan menyenangkan (>.<) \n '}).commit())
  })
})

bot.on('text', ({replyToken, source, source: { type }, message: { text }}) => {
  if (text == '/join') {
    room.createRoom('test');

    bot.getProfile(source[`${source.type}Id`]).then(({data: {displayName}}) => {
      room.addUser({lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: 'test'})
      room.syncReducer({database, user: source, roomId: 'test'})
      room.onlineUser({roomId: 'test', callback: ({users}) => {
        bot.pushMessage(source.userId, new Bot.Messages().addText(`Online User: \n\n ${users.map(user => (`${user.displayName}`)).join('\n')}`).commit());
      }});
    });
  } else if (text == '/start') {
    questions.start();
    const timer = questions.getTimer();
    bot.pushMessage(source.userId, new Bot.Messages().addText(`Pertanyaan berikutnya akan muncul dalam ${timer} detik`).commit());
  } else if (text.indexOf('/jawab ') != -1) {
    const answerSplit = text.split('/jawab ');
    const answerText = answerSplit[1];
    questions.checkAnswer({answerText, lineId: source.userId, roomId: 'test'});
  } else if (text == '/highscore') {
    room.listHighscore({roomId: 'test', callback: ({user, highscores}) => {
      bot.pushMessage(user.lineId, new Bot.Messages().addText(`Highscore: \n\n ${highscores.map(user => (`${user.displayName} = ${user.score}`)).join('\n')}`).commit());
    }});
  } else if (text == '/exit') {
    room.syncScore({database, lineId: source.userId, roomId: 'test'})
    room.removeUser({lineId: source.userId, roomId: 'test'});
  }
});
