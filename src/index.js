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

// const Bot = require('node-line-messaging-api');
// const ID = `1506324098`
// const SECRET = `67cdf8ca5562c3b558c66d88115762c7`
// const TOKEN = `qP7mjb0JygPTaztahWWNdv+3x1oQEcYAk3jAcORqe7Ictlfza8qCuG8eTb2VAfppXhh73MG3gAAuW42/SCGoyjB3N/9NFsSe6rh0I0xM9WAEVvTnKqIPXIXtOn9UbGIoQIqvEg12mQ39tQ+o+Y3n6gdB04t89/1O/w1cDnyilFU=`

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
let currentTimer = null;

room.syncReducer({database})

store.subscribe(() => {
  const state = store.getState();

  if (currentUsers != state.users && Object.keys(state.users).length > 0) {
    currentUsers = state.users
    room.syncScore({database})
  }

  if (currentTimer != state.timer) {
    currentTimer = state.timer;
    if (currentTimer == 5) {
      room.broadCastAnswerState(({user, answerState, position}) => {
        if (answerState) {
          if (position == 0) {
            bot.pushMessage(user.lineId, new Bot.Messages().addSticker({packageId: 1, stickerId: 114}).addText(`Yeay, kamu berhasil menjadi penjawab pertama pertahankan terus...`).commit());
          } else {
            bot.pushMessage(user.lineId, new Bot.Messages().addSticker({packageId: 1, stickerId: 2}).addText(`Mantap. kamu berhasil menjawab pertanyaan, kalo bisa lebih cepat menjawab supaya scorenya lebih tinggi...`).commit());
          }
        } else {
          bot.pushMessage(user.lineId, new Bot.Messages().addSticker({packageId: 1, stickerId: 16}).addText(`Waduh, kamu belum menjawab pertanyaan, semangat!`).commit());
        }
      });
      room.broadCastAll((user) => {
        bot.pushMessage(user.lineId, new Bot.Messages().addText(`Pertanyaan berikutnya akan muncul dalam 5 detik.`).commit());
      });
    }
  }

  if (questionId !== state.questionId) {
    questionId = state.questionId;
    const pertanyaan = state.activeQuestion.question;
    const randomAnswer = state.activeQuestion.randomAnswer;

    room.broadCastAll((user) => {
      bot.pushMessage(user.lineId, new Bot.Messages().addText(`${pertanyaan}\n\n${randomAnswer}`).commit());
    });

    room.checkUserActive((user) => {
      bot.pushMessage(user.lineId, new Bot.Messages()
        .addButtons({
          altText: 'Kamu sudah lama tidak menjawab ketik /exit untuk keluar, atau /continue untuk tetap bermain',
          title: 'Acakata',
          text: 'Kamu sudah lama tidak menjawab, mau melanjutkan game?',
          actions: [
            {
              type: 'message',
              label: 'Lanjutkan Permainan',
              text: '/continue'
            },
            {
              type: 'message',
              label: 'Keluar Permainan',
              text: '/exit'
            },
            
          ]
        }).commit());
    })
  }

  if (state.answers.length != answersLength) {
    answersLength = state.answers.length;
    const lastAnswer = state.answers[answersLength - 1];
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
          bot.pushMessage(user.lineId, new Bot.Messages().addText(`${lastAnswer.displayName} menjawab ${lastAnswer.answerText}`).commit());
        }
      }
      });
    }
  }
})

room.createRoom('test');
questions.start();

bot.on('webhook', ({port, endpoint}) => {
  console.log(`bot listens on port ${port}.`)
})

bot.on('follow', (event) => {
  bot.getProfileFromEvent(event).then(({displayName}) => {
    console.log(event.replyToken, displayName);
    bot.replyMessage(event.replyToken, new Bot.Messages().addText(`Halo ${displayName}!\n\nKenalin aku bot acakata. Kita bisa main tebak tebakan kata multiplayer loh sama teman-teman lain yang lagi online.

Cara mainnya gampang, kita tinggal cepet-cepetan menebak dari petunjuk dan kata yang diacak. Semakin cepat kita menebak benar maka score yang kita dapat semakin tinggi. Serunya, kita bertanding sama semua orang yang lagi main online juga!`)
      .addSticker({packageId: 1, stickerId: 406})
      .addButtons({
        thumbnailImageUrl: 'https://firebasestorage.googleapis.com/v0/b/memeline-76501.appspot.com/o/acakatacover.png?alt=media&token=85134e75-bdc7-4747-9590-1915b79baf0a',
        altText: 'Silakan ketik\n\n/battle untuk mulai battle\n/startduel untuk mulai duel\n/highscore untuk lihat score tertinggi\n/help untuk melihat cara bermain\n/exit untuk keluar dari battle atau duel',
        title: 'Acakata Menu',
        text: 'Mau mulai main?',
        actions: [
          {
            type: 'message',
            label: 'Mulai Battle',
            text: '/battle'
          },
          {
            type: 'message',
            label: 'Duel 1 vs 1',
            text: '/startduel'
          },
          {
            type: 'message',
            label: 'Highscore',
            text: '/highscore'
          },
          {
            type: 'message',
            label: 'Cara Bermain',
            text: '/help'
          }
        ]
      })
      .commit()).catch(e => {
        console.log('ERROR ', e);
      })
  })
})

bot.on('text', ({replyToken, source, source: { type }, message: { text }}) => {
  if (text == '/battle') {
    bot.getProfile(source[`${source.type}Id`]).then(({displayName}) => {
      room.addUser({lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: 'test'})
      room.onlineUser({roomId: 'test', callback: ({users}) => {
        const timer = questions.getTimer();
        bot.pushMessage(source.userId, new Bot.Messages().addText(`Pertanyaan berikutnya akan muncul dalam ${timer} detik`).commit());
        if (users.length <= 10 && users.length > 1) {
          bot.pushMessage(source.userId, new Bot.Messages().addText(`Berikut ini pemain yang online:\n\n${users.filter(user => user.lineId != source.userId).map(user => (`- ${user.displayName}`)).join('\n')}`).commit());
        }
        bot.pushMessage(source.userId, new Bot.Messages().addText(`Ada ${users.length} pemain yang online`).commit());
      }});
    });
  } else if (text == '/help') {
    bot.pushMessage(source.userId, new Bot.Messages().addSticker({packageId: 1, stickerId: 406}).addText(`Cara mainnya gampang, kita tinggal cepet-cepetan menebak dari petunjuk dan kata yang diacak. Semakin cepat kita menebak benar maka score yang kita dapat semakin tinggi. Serunya, kita bertanding sama semua orang yang lagi main online juga!`).commit());
  } else if (text == '/startduel') {
    const nameUser = text.split(' ')[1]
    bot.pushMessage(source.userId, new Bot.Messages().addText(`Untuk mengundang duel silakan ketik\n\n/duel <salah satu nama di bawah>`).commit());
    room.listHighscore({userId: source.userId, callback: ({user, highscores}) => {
      bot.pushMessage(user.lineId, new Bot.Messages().addText(`${highscores.map(user => (`- ${user.displayName} = ${user.score}`)).join('\n')}`).commit());
    }});
  } else if (text.indexOf('/duel') > -1) {
    const nameUser = text.split(' ')[1]
    bot.getProfile(source[`${source.type}Id`]).then(({displayName}) => {
      const arrayName = [nameUser, displayName].sort()
      room.createRoom(`${arrayName[0]}-${arrayName[1]}`);
      room.addUser({lineId: source.userId, displayName: displayName, replyToken: replyToken, roomId: `${arrayName[0]}-${arrayName[1]}`})

      room.onlineUser({roomId: `${arrayName[0]}-${arrayName[1]}`, callback: ({users}) => {
        if (users.length > 1) {
          bot.pushMessage(source.userId, new Bot.Messages().addText(`Duel sudah dimulai`).commit());
        } else {
          bot.pushMessage(source.userId, new Bot.Messages().addText(`Menunggu lawan duel`).commit());
        }
      }});
    });
  } else if (text == '/continue') {
    room.exte
  } else if (text == '/highscore') {
    room.listHighscore({userId: source.userId, callback: ({user, highscores}) => {
      bot.pushMessage(user.lineId, new Bot.Messages().addText(`Highscore: \n\n${highscores.map(user => (`- ${user.displayName} = ${user.score}`)).join('\n')}`).commit());
    }});
  } else if (text == '/exit') {
    room.removeUser({lineId: source.userId});
  } else if (room.checkUserExist({lineId: source.userId})) {
    const answerText = text;

    questions.checkAnswer({answerText, lineId: source.userId});
  }
});
