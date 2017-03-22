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
const Bot = require('node-line-messaging-api');
const ID = `1501455661`
const SECRET = `367d38f1f36d2b9c3de59437a88ddd23`
const TOKEN = `8Rn/qNeXALta5QAW9d/bSeT4qGsdSTH8VF3d+GFIARxEPOoTC+Sl0+3KdIVLXXOUelUDlxociqtljNPP3py59QH9ECwZbd3AvWBTC2IAHYEZDpYm3QhZE+m6+/aUYQPU18WXCFZ+XTZocY6FcCmp3QdB04t89/1O/w1cDnyilFU=`

const PORT = process.env.PORT || 3002
const bot = new Bot({
  secret: SECRET,
  token: TOKEN,
  options: {
    port: PORT,
    tunnel: false,
    verifySignature: true
  }
});

import reducers from './reducers';
import {createStore} from 'redux';

const store = createStore(reducers);
const questions = new Questions(store);
const room = new Rooms(store);

let questionId = null;
let answersLength = 0;
let currentUsers = null;

room.syncReducer({database})



store.subscribe(() => {
  const state = store.getState();

  if (currentUsers != state.users) {
    currentUsers = state.users
    room.syncScore({database})
  }

  if (questionId !== state.questionId) {
    questionId = state.questionId;
    const pertanyaan = state.activeQuestion.question;
    const randomAnswer = state.activeQuestion.randomAnswer;

    room.broadCastAll((user) => {
      bot.pushMessage(user.lineId, new Bot.Messages().addText(`Petunjuk: ${pertanyaan} \n\n ${randomAnswer}`).commit());
    });
  }

  if (state.answers.length != answersLength) {
    answersLength = state.answers.length;
    const lastAnswer = state.answers[answersLength - 1];
    console.log(lastAnswer)
    if (lastAnswer) {
      room.broadCast({roomId: lastAnswer.roomId, callback: (user) => {
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
      });
    }
  }
})

bot.on('webhook', ({port, endpoint}) => {
  console.log(`bot listens on port ${port}.`)
})

bot.on('follow', (event) => {
  bot.getProfileFromEvent(event).then(({displayName}) => {
    console.log(event.replyToken, displayName);
    bot.replyMessage(event.replyToken, new Bot.Messages().addText(`Halo ${displayName}! Kenalin aku bot acakata. Kita bisa main tebak tebakan kata multiplayer loh sama teman-teman lain yang lagi online.

Cara mainnya gampang, kita tinggal cepet-cepetan menebak dari petunjuk dan kata yang diacak. Semakin cepat kita menebak benar maka score yang kita dapat semakin tinggi. Serunya, kita bertanding sama semua orang yang lagi main online juga!`)
      .addSticker({packageId: 1, stickerId: 406})
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
      .commit())
  })
})

bot.on('text', ({replyToken, source, source: { type }, message: { text }}) => {
  if (text == '/join') {
    room.createRoom('test');
    bot.getProfile(source[`${source.type}Id`]).then(({displayName}) => {
      room.addUser({lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: 'test'})

      room.onlineUser({roomId: 'test', callback: ({users}) => {
        if(users.length > 20) {
          bot.pushMessage(source.userId, new Bot.Messages().addText(`Online User: \n\n ${users.length} users`).commit());
        }else {
          bot.pushMessage(source.userId, new Bot.Messages().addText(`Online User: \n\n ${users.map(user => (`${user.displayName}`)).join('\n')}`).commit());
        }
      }});
    });
  }else if (text.indexOf('/duel') > -1) {
    const nameUser = text.split(' ')[1]
    bot.getProfile(source[`${source.type}Id`]).then(({displayName}) => {
      const arrayName = [nameUser, displayName].sort()
      room.createRoom(`${arrayName[0]}-${arrayName[1]}`);
      console.log(`${arrayName[0]}-${arrayName[1]}`)
      room.addUser({lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: `${arrayName[0]}-${arrayName[1]}`})

      room.onlineUser({roomId: `${arrayName[0]}-${arrayName[1]}`, callback: ({users}) => {
        if(users.length > 20) {
          bot.pushMessage(source.userId, new Bot.Messages().addText(`Online User: \n\n ${users.length} users`).commit());
        }else {
          bot.pushMessage(source.userId, new Bot.Messages().addText(`Online User: \n\n ${users.map(user => (`${user.displayName}`)).join('\n')}`).commit());
        }
      }});
    });
  }
  else if (text == '/start') {
    room.createRoom('test');
    questions.start();
    const timer = questions.getTimer();
    bot.pushMessage(source.userId, new Bot.Messages().addText(`Pertanyaan berikutnya akan muncul dalam ${timer} detik`).commit());
  } else if (text == '/highscore') {
    room.listHighscore({userId: source.userId, callback: ({user, highscores}) => {
      bot.pushMessage(user.lineId, new Bot.Messages().addText(`Highscore: \n\n ${highscores.map(user => (`${user.displayName} = ${user.score}`)).join('\n')}`).commit());
    }});
  } else if (text == '/exit') {
    room.removeUser({lineId: source.userId});
  } else if (room.checkUserExist({lineId: source.userId})) {
    const answerText = text;

    questions.checkAnswer({answerText, lineId: source.userId});
  }
});
