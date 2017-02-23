class Rooms {
  constructor() {
    this.rooms = {}
  }

  createRooms() {
    const roomName = this.generateRoomsName()
    this.rooms[roomName] = []
  }

  addUser({ id, roomName }) {
    if(this.rooms[roomName]) {
      this.rooms[roomName].add(new User({ id }))
    }
  }

  generateRoomsName() {
    return Math.random()
  }

  deleteRooms({ roomName }) {
    delete this.rooms[roomName]
  }
}


export default Rooms;
