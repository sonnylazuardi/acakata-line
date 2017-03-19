import uuid from 'uuid';
import ctrl from './userController';

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

  removeUser({ lineId, roomId }) {
    const store = this.store;
    store.dispatch({
      type: 'REMOVE_USER',
      payload: {
        user: {
          lineId,
          roomId
        }
      }
    });
  }

  broadCast({roomId, callback}) {
    const state = this.store.getState();
    Object.keys(state.rooms[roomId]).forEach((key) => {
      const user = state.rooms[roomId][key];
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

  syncScore({database, lineId, roomId}) {
    const state = this.store.getState();
    const user = state.rooms[roomId][lineId];
    database.ref('users/' + lineId).set({
      score: user.score,
      lineId: user.lineId,
      displayName : user.displayName,
      replyToken: user.replyToken
    });

  }

  syncReducer({database, user, roomId}) {
    const store = this.store
    const state = store.getState();
    let result = null;
    database.ref('users/' + user.userId).once('value').then(function(snapshot) {
      result = snapshot.val();
      store.dispatch({
        type: 'SYNC',
        payload: {
          user: {
            lineId: result.lineId,
            replyToken: result.replyToken,
            score: result.score,
            roomId: roomId,
            displayName: result.displayName
          }
        }
      });
    });
  }
}
