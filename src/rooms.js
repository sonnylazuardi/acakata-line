import uuid from 'uuid';
import { createSelector } from 'reselect'

const usersSelector = state => state.users
const roomsSelector = state => state.rooms
const roomUserSelector = createSelector(
  usersSelector,
  roomsSelector,
  (users, rooms) => {
    let detailRooms = {}
    console.log("**********")
    console.log(users)
    Object.keys(rooms).forEach((roomId) => {
      detailRooms[roomId] = {}
      Object.keys(rooms[roomId]).forEach((userId) => {
        detailRooms[roomId][userId]= users[userId]

      })
    })
    console.log(detailRooms)
    return detailRooms
  }
)

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

  removeUser({ lineId }) {
    const store = this.store;
    store.dispatch({
      type: 'REMOVE_USER',
      payload: {
        user: {
          lineId
        }
      }
    });
  }

  broadCastAll(callback) {
    const state = this.store.getState();
    Object.keys(state.rooms).forEach((roomId) => {
      Object.keys(state.rooms[roomId]).forEach((key) => {
        const user = state.rooms[roomId][key];
        callback(user);
      })
    })

  }
  broadCast({roomId, callback}) {
    const state = this.store.getState();
    Object.keys(state.rooms[roomId]).forEach((key) => {
      const user = state.rooms[roomId][key];
      callback(user);
    })
  }

  listHighscore({userId, callback}) {
    const state = this.store.getState();
    const detailRooms = roomUserSelector(state)
    console.log(state.users[userId])
    if(!state.users[userId] || !state.users[userId].activeRoomId) {


      const high = Object.keys(state.users).map((key) => {
        return state.users[key]
      }).sort((a,b) => {
        return b.score - a.score;
      })


      callback({user:{lineId:userId}, highscores:high});
      return;
    }
    const roomId = state.users[userId].activeRoomId
    const highscores = Object.keys(detailRooms[roomId]).map(key => {
      const user = detailRooms[roomId][key];
      return user;
    }).sort((a, b) => {
      return b.score - a.score;
    });

    Object.keys(detailRooms[roomId]).forEach((key) => {
      const user = detailRooms[roomId][key];
      callback({user, highscores});
    })
  }

  onlineUser({roomId, callback}) {
    const state = this.store.getState();
    const detailRooms = roomUserSelector(state)
    const users = Object.keys(detailRooms[roomId]).map(key => {
      const user = detailRooms[roomId][key];
      return user;
    })
    callback({users});
  }

  checkUserExist({lineId}) {
    const state = this.store.getState();

    return state.users[lineId] && state.users[lineId].activeRoomId;
  }

  syncScore({database}) {
    const state = this.store.getState();
    const user = state.users;
    console.log(user)
    database.ref('users/').set(user);

  }

  syncReducer({database}) {
    const store = this.store
    const state = store.getState();
    let result = null;
    database.ref('users').once('value').then(function(snapshot) {
      result = snapshot.val();
      if (result) {
        store.dispatch({
          type: 'SYNC',
          payload: {
            users: result
          }
        });
      }
    });
  }
}
