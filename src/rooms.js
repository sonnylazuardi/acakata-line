
const User = require('./users.js').default

export default class Rooms {
  constructor() {
    this.rooms = {}
  }

  createRooms() {
    const roomName = this.generateRoomsName()
    if (!this.rooms.hasOwnProperty('test')) {
      this.rooms['test'] = []
    }
  }

  addUser({ id, replyToken, roomName }) {
    if(this.rooms[roomName]) {
      this.rooms[roomName][id] = new User({ id, replyToken })
      console.log(this.rooms[roomName])
    }
  }

  generateRoomsName() {
    return Math.random()
  }

  deleteRooms({ roomName }) {
    delete this.rooms[roomName]
  }

  checkUserExist(roomName, id) {
    return this.rooms[roomName].hasOwnProperty(id)
  }

  broadCast({source, roomName , message, callback}) {
    Object.keys(this.rooms[roomName]).forEach((key) => {
      if(source == key) {
        const user = this.rooms[roomName][key]
        callback(user)
      }  
    })
  }
}
