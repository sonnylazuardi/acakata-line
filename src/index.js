import Rooms from './rooms'
import Questions from './questions';

const EventEmitter = require('eventemitter3')

const Bot = require('node-line-messaging-api');
const ID = `1501455661`
const SECRET = `367d38f1f36d2b9c3de59437a88ddd23`
const TOKEN = `8Rn/qNeXALta5QAW9d/bSeT4qGsdSTH8VF3d+GFIARxEPOoTC+Sl0+3KdIVLXXOUelUDlxociqtljNPP3py59QH9ECwZbd3AvWBTC2IAHYEZDpYm3QhZE+m6+/aUYQPU18WXCFZ+XTZocY6FcCmp3QdB04t89/1O/w1cDnyilFU=`

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
      console.log(displayName);
      room.addUser({lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: 'test'})
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
  }
});
