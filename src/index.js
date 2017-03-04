const Rooms = require('./rooms.js').default

const EventEmitter = require('eventemitter3')

const Bot = require('node-line-messaging-api');
const ID = `1501455661`
const SECRET = `367d38f1f36d2b9c3de59437a88ddd23`
const TOKEN = `8Rn/qNeXALta5QAW9d/bSeT4qGsdSTH8VF3d+GFIARxEPOoTC+Sl0+3KdIVLXXOUelUDlxociqtljNPP3py59QH9ECwZbd3AvWBTC2IAHYEZDpYm3QhZE+m6+/aUYQPU18WXCFZ+XTZocY6FcCmp3QdB04t89/1O/w1cDnyilFU=`

const PORT = process.env.PORT || 3002
const bot = new Bot(SECRET, TOKEN, { webhook: { port: PORT, ngrok: false } })
const room = new Rooms()

bot.on('webhook', w => {
  console.log(`bot listens on port ${w}.`)
})

bot.on('follow', ({replyToken, source}) => {
  bot.getProfile(source[`${source.type}Id`]).then(({data: {displayName}}) => {
    bot.replyMessage(replyToken, new Messages().addText(`Selamat Datang di MemeLine, ${displayName}!`).addText({text: 'Cara gampang bikin meme (>.<) \n Silakan masukan tulisan teks pada atas gambar'}).commit())
  })
})

bot.on('text', ({replyToken, source, source: { type }, message: { text }}) => {
  const sourceId = source[`${type}Id`];
  // bot.replyMessage(replyToken, new Bot.Messages().addText(text).commit());
  if(text == '/join') {
    room.createRooms();
    room.addUser({id:source.userId, replyToken: replyToken, roomName:'test'})
    room.broadCast({roomName:'test', message:'something', callback: (user) => {
      bot.replyMessage(user.replyToken, new Bot.Messages().addText(`${user.lineId} said: broadcast`).commit());
    }})
  }

});
