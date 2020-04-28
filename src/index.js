const Rooms = require("./rooms");
const Questions = require("./questions");

const firebase = require("firebase-admin");

var serviceAccount = require("./firebase");

var serviceAccount = require("./acakkata-firebase.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://acakkata-12bf7.firebaseio.com",
});
var database = firebase.database();

// const env = process.env.NODE_ENV || "development";

// if (env == "production") {
var Bot = require("node-line-messaging-api");
var ID = `1507311327`;
var SECRET = `3a7b96e53ebe774ee732b92ad55155e5`;
var TOKEN = `yDlUdRjgGAhGHjD9mWesunOz0oIDP/mXzFcdE55103Qytpvw7mZP8eDm+Kt0eMDUp16l+pdit39oRqXOPthRHptkZLxtuIrEChvNvjM2ISPSP14ktW7fM8KTSryHygKEuOMOzgbEamFDNUwWmhN4QwdB04t89/1O/w1cDnyilFU=`;
// } else {
// var Bot = require("node-line-messaging-api");
// var ID = `1506324098`;
// var SECRET = `67cdf8ca5562c3b558c66d88115762c7`;
// var TOKEN = `qP7mjb0JygPTaztahWWNdv+3x1oQEcYAk3jAcORqe7Ictlfza8qCuG8eTb2VAfppXhh73MG3gAAuW42/SCGoyjB3N/9NFsSe6rh0I0xM9WAEVvTnKqIPXIXtOn9UbGIoQIqvEg12mQ39tQ+o+Y3n6gdB04t89/1O/w1cDnyilFU=`;
// }

const PORT = process.env.PORT || 3002;
const bot = new Bot({
  secret: SECRET,
  token: TOKEN,
  options: {
    port: PORT,
    tunnel: false,
    verifySignature: true,
  },
});

const reducers = require("./reducers");
const { createStore } = require("redux");

const store = createStore(reducers);
const questions = new Questions(store);
const room = new Rooms(store);

let questionId = null;
let answersLength = 0;
let currentUsers = null;
let currentTimer = null;

room.syncReducer({ database });

database.ref("updates").on("child_added", (snapshot) => {
  var result = snapshot.val();
  if (result) {
    if (!result.stickerId || !result.packageId) {
      result.stickerId = 114;
      result.packageId = 1;
    }
    room.broadCastUsers((user) => {
      let button = {
        altText: `${result.title} - ${result.description}`,
        title: result.title,
        text: result.description,
        actions: [
          {
            type: "message",
            label: "Menu",
            text: "/menu",
          },
        ],
      };
      if (result.thumbnailImageUrl)
        button.thumbnailImageUrl = result.thumbnailImageUrl;
      bot.pushMessage(
        user.lineId,
        new Bot.Messages()
          .addButtons(button)
          .addSticker({
            packageId: result.packageId,
            stickerId: result.stickerId,
          })
          .commit()
      );
    });
  }
});

// sync questions
// const stateQuestions = store.getState().questions;
// let resultQuestions = {};
// stateQuestions.forEach((question, i) => {
//   resultQuestions[i] = question;
// });
// database.ref('questions/').set(resultQuestions);
let nameDatabase;
// if (env == "production") {
nameDatabase = "questions";
questions.syncQuestion({ database, name: "questions" });
// } else {
//   nameDatabase = "questionbaru";
//   questions.syncQuestion({ database, name: "questionbaru" });
// }

store.subscribe(() => {
  const state = store.getState();

  if (
    currentUsers != state.users &&
    Object.keys(state.users || {}).length > 0
  ) {
    currentUsers = state.users;
    console.log("SYNC to FIREBASE");
    room.syncScore({ database });
  }

  if (state.questions.length == 1) {
    console.log("pertanyaan sudah mau habis SYNC PERTANYAAN");
    questions.syncQuestion({ database, name: nameDatabase });
  }

  if (currentTimer != state.timer) {
    currentTimer = state.timer;
    if (currentTimer == 5) {
      room.broadCastAnswerState(({ user, answerState, position }) => {
        if (answerState) {
          if (position == 0) {
            bot.pushMessage(
              user.lineId,
              new Bot.Messages()
                .addSticker({ packageId: 1, stickerId: 114 })
                .addText(
                  `Yeay, kamu berhasil menjadi penjawab pertama pertahankan terus...`
                )
                .commit()
            );
          } else {
            bot.pushMessage(
              user.lineId,
              new Bot.Messages()
                .addSticker({ packageId: 1, stickerId: 2 })
                .addText(
                  `Mantap. kamu berhasil menjawab pertanyaan, kalo bisa lebih cepat menjawab supaya scorenya lebih tinggi...`
                )
                .commit()
            );
          }
        } else {
          bot.pushMessage(
            user.lineId,
            new Bot.Messages()
              .addSticker({ packageId: 1, stickerId: 16 })
              .addText(`Waduh, kamu belum menjawab pertanyaan, semangat!`)
              .commit()
          );
        }
      });
      room.broadCastAll((user) => {
        questions.nextRound();
        const currentRound = questions.getRound();
        bot.pushMessage(
          user.lineId,
          new Bot.Messages()
            .addText(`Pertanyaan berikutnya akan muncul dalam 5 detik.`)
            .commit()
        );
      });
    }
  }

  if (questionId !== state.questionId) {
    questionId = state.questionId;
    const pertanyaan = state.activeQuestion.question;
    const randomAnswer = state.activeQuestion.randomAnswer;

    room.broadCastAll((user) => {
      bot.pushMessage(
        user.lineId,
        new Bot.Messages().addText(`${pertanyaan}\n\n${randomAnswer}`).commit()
      );
    });

    room.checkUserActive((user) => {
      bot.pushMessage(
        user.lineId,
        new Bot.Messages()
          .addButtons({
            altText: " /exit untuk keluar, atau /continue untuk tetap bermain",
            title: "Acakata",
            text: "Kamu sudah main satu ronde, mau melanjutkan game?",
            actions: [
              {
                type: "message",
                label: "Lanjutkan Permainan",
                text: "/continue",
              },
              {
                type: "message",
                label: "Lihat Highscore",
                text: "/highscore",
              },
              {
                type: "message",
                label: "Keluar Permainan",
                text: "/exit",
              },
            ],
          })
          .commit()
      );
    });
  }

  if (state.answers.length != answersLength) {
    answersLength = state.answers.length;
    const lastAnswer = state.answers[answersLength - 1];
    if (lastAnswer) {
      room.broadCast({
        roomId: lastAnswer.roomId,
        callback: (user) => {
          if (lastAnswer.answerState) {
            if (lastAnswer.addedScore == 10) {
              bot.pushMessage(
                user.lineId,
                new Bot.Messages()
                  .addSticker({ packageId: 1, stickerId: 114 })
                  .addText(
                    `${lastAnswer.displayName} menjawab dengan benar (+10)`
                  )
                  .commit()
              );
            } else if (lastAnswer.addedScore == 5) {
              bot.pushMessage(
                user.lineId,
                new Bot.Messages()
                  .addText(
                    `${lastAnswer.displayName} menjawab ${lastAnswer.answerText} (+5)`
                  )
                  .commit()
              );
            } else {
              bot.pushMessage(
                user.lineId,
                new Bot.Messages()
                  .addText(`${lastAnswer.displayName} menjawab benar (+1)`)
                  .commit()
              );
            }
          } else {
            bot.pushMessage(
              user.lineId,
              new Bot.Messages()
                .addText(
                  `${lastAnswer.displayName} menjawab ${lastAnswer.answerText}`
                )
                .commit()
            );
          }
        },
      });
    }
  }
});
room.createRoom("test");
questions.start();
const showOnBoarding = (displayName) => {
  return new Bot.Messages()
    .addText(
      `Halo ${displayName}!\n\nKenalin aku bot acakata. Kita bisa main tebak tebakan kata multiplayer loh sama teman-teman lain yang lagi online.

Cara mainnya gampang, kita tinggal cepet-cepetan menebak dari petunjuk dan kata yang diacak. Semakin cepat kita menebak benar maka score yang kita dapat semakin tinggi. Serunya, kita bertanding sama semua orang yang lagi main online juga!`
    )
    .addSticker({ packageId: 1, stickerId: 406 })
    .commit();
};

const showMenu = (displayName) => {
  return new Bot.Messages()
    .addButtons({
      thumbnailImageUrl:
        "https://firebasestorage.googleapis.com/v0/b/acakkata-12bf7.appspot.com/o/coverpage.png?alt=media&token=15c56252-404f-49e9-b9c9-c8121fd9aba3",
      altText:
        "Silakan ketik\n\n/battle untuk mulai battle\n/startduel untuk mulai duel\n/highscore untuk lihat score tertinggi\n/help untuk melihat cara bermain\n/exit untuk keluar dari battle atau duel",
      title: "Acakata Menu",
      text: "Mau mulai main?",
      actions: [
        {
          type: "message",
          label: "Mulai Main",
          text: "/battle",
        },
        {
          type: "message",
          label: "Duel 1 vs 1",
          text: "/startduel",
        },
        {
          type: "message",
          label: "Highscore",
          text: "/highscore",
        },
        {
          type: "message",
          label: "Keluar",
          text: "/exit",
        },
      ],
    })
    .commit();
};

const showShare = (user) => {
  return new Bot.Messages()
    .addButtons({
      thumbnailImageUrl: `https://images.weserv.nl/?url=${user.pictureUrl.replace(
        /http:\/\//g,
        ""
      )}&w=300`,
      altText: `Skor ${user.displayName} adalah ${user.score}`,
      title: `Skor ${user.displayName}`,
      text: `Skor ${user.displayName} adalah ${user.score}`,
      actions: [
        {
          type: "uri",
          label: "Share",
          uri: `http://acakatagame.com/score/${user.lineId}`,
        },
        {
          type: "message",
          label: "Menu",
          text: `/menu`,
        },
      ],
    })
    .commit();
};

const showHighscoreCarousel = (highscores) => {
  const columns = highscores.map((user, i) => {
    return {
      thumbnailImageUrl: user.pictureUrl
        ? `https://images.weserv.nl/?url=${user.pictureUrl.replace(
            /http:\/\//g,
            ""
          )}&w=300`
        : "https://firebasestorage.googleapis.com/v0/b/acakkata-12bf7.appspot.com/o/coverpage.png?alt=media&token=15c56252-404f-49e9-b9c9-c8121fd9aba3",
      title: user.displayName,
      text: `ada di posisi ${i + 1} dengan skor ${user.score}`,
      actions: [
        {
          type: "uri",
          label: "Share",
          uri: `http://acakatagame.com/score/${user.lineId}`,
        },
      ],
    };
  });

  return new Bot.Messages()
    .addCarousel({ altText: `Lihat highscore di smartphone kamu`, columns })
    .commit();
};

// .addButtons({
//       thumbnailImageUrl: ,
//       altText: 'Silakan ketik\n\n/battle untuk mulai battle\n/startduel untuk mulai duel\n/highscore untuk lihat score tertinggi\n/help untuk melihat cara bermain\n/exit untuk keluar dari battle atau duel',
//       title: 'Acakata Menu',
//       text: 'Mau mulai main?',
//       actions: [
//         {
//           type: 'message',
//           label: 'Mulai Main',
//           text: '/battle'
//         },
//         {
//           type: 'message',
//           label: 'Duel 1 vs 1',
//           text: '/startduel'
//         },
//         {
//           type: 'message',
//           label: 'Highscore',
//           text: '/highscore'
//         },
//         {
//           type: 'message',
//           label: 'Keluar',
//           text: '/exit'
//         }
//       ]
//     })

bot.on("webhook", ({ port, endpoint }) => {
  console.log(`bot listens on port ${port}.`);
});

bot.on("follow", (event) => {
  bot.getProfileFromEvent(event).then((data) => {
    room.addUserFollow({
      lineId: event.source.userId,
      displayName: data.displayName,
      pictureUrl: data.pictureUrl,
    });
    bot.pushMessage(event.source.userId, showMenu());
    bot
      .pushMessage(event.source.userId, showOnBoarding(data.displayName))
      .catch((err) => console.log(err));
  });
});

bot.on(
  "text",
  ({ replyToken, source, source: { type }, message: { text } }) => {
    if (text == "/battle") {
      bot
        .getProfile(source[`${source.type}Id`])
        .then(({ displayName, pictureUrl }) => {
          room.addUser({
            lineId: source.userId,
            displayName: displayName,
            replyToken: replyToken,
            roomId: "test",
            pictureUrl: pictureUrl,
          });
          room.onlineUser({
            roomId: "test",
            callback: ({ users }) => {
              room.broadCast({
                roomId: "test",
                callback: (user) => {
                  bot.pushMessage(
                    user.lineId,
                    new Bot.Messages()
                      .addText(`${displayName} baru saja masuk battle`)
                      .commit()
                  );
                },
              });

              const timer = questions.getTimer();
              bot.pushMessage(
                source.userId,
                new Bot.Messages()
                  .addText(
                    `Pertanyaan berikutnya akan muncul dalam ${timer} detik`
                  )
                  .commit()
              );
              if (users.length <= 10 && users.length > 1) {
                bot.pushMessage(
                  source.userId,
                  new Bot.Messages()
                    .addText(
                      `Berikut ini pemain yang online:\n\n${users
                        .filter((user) => user.lineId != source.userId)
                        .map((user) => `- ${user.displayName}`)
                        .join("\n")}`
                    )
                    .commit()
                );
              }
              bot.pushMessage(
                source.userId,
                new Bot.Messages()
                  .addText(`Ada ${users.length} pemain yang online`)
                  .commit()
              );
            },
          });
        });
    } else if (text == "/help") {
      bot.pushMessage(
        source.userId,
        new Bot.Messages()
          .addSticker({ packageId: 1, stickerId: 406 })
          .addText(
            `Cara mainnya gampang, kita tinggal cepet-cepetan menebak dari petunjuk dan kata yang diacak. Semakin cepat kita menebak benar maka score yang kita dapat semakin tinggi. Serunya, kita bertanding sama semua orang yang lagi main online juga!`
          )
          .commit()
      );
    } else if (text == "/startduel") {
      bot.pushMessage(
        source.userId,
        new Bot.Messages()
          .addText(
            `Untuk mengundang duel silakan ketik\n\n/duel <salah satu nama>`
          )
          .commit()
      );
      room.onlineUser({
        roomId: "test",
        callback: ({ users }) => {
          if (users.length <= 10 && users.length > 1) {
            bot.pushMessage(
              source.userId,
              new Bot.Messages()
                .addText(
                  `Pemain yang online:\n\n${users
                    .filter((user) => user.lineId != source.userId)
                    .map((user) => `- ${user.displayName}`)
                    .join("\n")}`
                )
                .commit()
            );
          }
          bot.pushMessage(
            source.userId,
            new Bot.Messages()
              .addText(`Ada ${users.length} pemain yang online`)
              .commit()
          );
        },
      });
    } else if (text.indexOf("/duel") > -1) {
      const nameUser = text.split("/duel ")[1];
      bot
        .getProfile(source[`${source.type}Id`])
        .then(({ displayName, pictureUrl }) => {
          const arrayName = [nameUser, displayName].sort();
          room.createRoom(`${arrayName[0]}-${arrayName[1]}`);

          const state = store.getState();
          const currentUser = state.users[source.userId];

          if (
            currentUser &&
            currentUser.activeRoomId == `${arrayName[0]}-${arrayName[1]}`
          ) {
            console.log("already in room");
            return;
          }
          room.removeUser({ lineId: source.userId });
          room.addUser({
            lineId: source.userId,
            displayName: displayName,
            replyToken: replyToken,
            roomId: `${arrayName[0]}-${arrayName[1]}`,
            pictureUrl: pictureUrl,
          });
          room.onlineUser({
            roomId: `${arrayName[0]}-${arrayName[1]}`,
            callback: ({ users }) => {
              if (users.length > 1) {
                room.broadCast({
                  roomId: `${arrayName[0]}-${arrayName[1]}`,
                  callback: (user) => {
                    bot.pushMessage(
                      user.lineId,
                      new Bot.Messages()
                        .addText(`${displayName} baru saja masuk duel`)
                        .commit()
                    );
                  },
                });
              } else {
                room.requestDuel({
                  displayName: nameUser,
                  callback: (user) => {
                    bot.pushMessage(
                      user.lineId,
                      new Bot.Messages()
                        .addButtons({
                          altText: `Silakan ketik\n\n/duel ${displayName} untuk memulai duel`,
                          title: "Acakata Duel",
                          text: `${displayName} menantang kamu duel, terima tantangan?`,
                          actions: [
                            {
                              type: "message",
                              label: "Terima Duel",
                              text: `/duel ${displayName}`,
                            },
                          ],
                        })
                        .commit()
                    );
                  },
                });
                bot.pushMessage(
                  source.userId,
                  new Bot.Messages().addText(`Menunggu lawan duel`).commit()
                );
              }
              const timer = questions.getTimer();
              bot.pushMessage(
                source.userId,
                new Bot.Messages()
                  .addText(
                    `Pertanyaan berikutnya akan muncul dalam ${timer} detik`
                  )
                  .commit()
              );
            },
          });
        });
    } else if (text == "/continue") {
      room.extendTime({ lineId: source.userId });
    } else if (text == "/highscore") {
      room.listHighscore({
        userId: source.userId,
        callback: ({ user, highscores, position }) => {
          bot.pushMessage(
            user.lineId,
            new Bot.Messages()
              .addText(
                `Highscore: \n\n${highscores
                  .map(
                    (user, i) => `${i + 1}. ${user.displayName} = ${user.score}`
                  )
                  .join("\n")}`
              )
              .commit()
          );
          bot.pushMessage(
            user.lineId,
            new Bot.Messages()
              .addText(`Kamu berada di urutan ke ${position + 1}`)
              .commit()
          );
          bot
            .pushMessage(user.lineId, showHighscoreCarousel(highscores))
            .catch((err) => console.log("ERR", err));
        },
      });
    } else if (text == "/exit") {
      const state = store.getState();
      const currentUser = state.users[source.userId];
      if (currentUser) {
        const roomId = currentUser.activeRoomId;
        room.broadCast({
          roomId: roomId,
          callback: (user) => {
            bot.pushMessage(
              user.lineId,
              new Bot.Messages()
                .addText(`${currentUser.displayName} baru saja keluar`)
                .commit()
            );
          },
        });
      }
      room.removeUser({ lineId: source.userId });
      bot.pushMessage(
        source.userId,
        new Bot.Messages().addText(`Kamu sudah keluar dari permainan`).commit()
      );
      bot
        .pushMessage(source.userId, showShare(currentUser))
        .catch((err) => console.log("ERR", err));
    } else if (text == "/menu") {
      bot.pushMessage(source.userId, showMenu());
    } else if (room.checkUserExist({ lineId: source.userId })) {
      const answerText = text;
      questions.checkAnswer({ answerText, lineId: source.userId });
    }
  }
);
