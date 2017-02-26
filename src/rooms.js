
const User = require('./users.js').default

export default class Rooms {
  constructor() {
    this.rooms = {}
  }

  createRooms() {
    const roomName = this.generateRoomsName()
    this.rooms['test'] = []
  }

  addUser({ id, replyToken, roomName }) {
    if(this.rooms[roomName]) {
      this.rooms[roomName].push(new User({ id, replyToken }))
    }
  }

  generateRoomsName() {
    return Math.random()
  }

  deleteRooms({ roomName }) {
    delete this.rooms[roomName]
  }

  broadCast({roomName , message, callback}) {
    for(let i =0;i<this.rooms[roomName].length;i++){
      const user = this.rooms[roomName][i]
      callback(user)
    }
  }
}
