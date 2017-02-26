export default class User {

  constructor({ id, replyToken}) {
    this.lineId = id
    this.score = 0
    this.lastMessage = ''
    this.replyToken = replyToken
  }

  addPoint() {
    score++;
  }
}
