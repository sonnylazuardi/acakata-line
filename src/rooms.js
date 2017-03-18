import uuid from 'uuid';

export default class Rooms {
  constructor(store) {
    this.store = store;
  }

  createRoom(roomId) {
    const store = this.store;
    store.dispatch({
      type: 'CREATE_ROOM',
      payload: {
        roomId
      }
    });
  }

  addUser({ lineId, replyToken, roomId, displayName }) {
    const store = this.store;
    store.dispatch({
      type: 'ADD_USER',
      payload: {
        user: {
          lineId,
          replyToken,
          roomId,
          displayName
        }
      }
    });
  }

  // deleteRooms({ roomName }) {
  //   delete this.rooms[roomName]
  // }

  // checkUserExist(roomName, id) {
  //   return this.rooms[roomName].hasOwnProperty(id)
  // }

  broadCast({roomId, callback}) {
    const state = this.store.getState();
    Object.keys(state.rooms[roomId]).forEach((key) => {
      const user = state.rooms[roomId][key];
      // console.log('USER', user);
      callback(user);
    })
  }

  listHighscore({roomId, callback}) {
    const state = this.store.getState();
    const highscores = Object.keys(state.rooms[roomId]).map(key => {
      const user = state.rooms[roomId][key];
      return user;
    }).sort((a, b) => {
      return b.score - a.score;
    });

    Object.keys(state.rooms[roomId]).forEach((key) => {
      const user = state.rooms[roomId][key];
      callback({user, highscores});
    })
  }
}
