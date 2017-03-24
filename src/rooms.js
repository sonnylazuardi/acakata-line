import uuid from 'uuid';
import { createSelector } from 'reselect'

const usersSelector = state => state.users
const roomsSelector = state => state.rooms
const roomUserSelector = createSelector(
  usersSelector,
  roomsSelector,
  (users, rooms) => {
    let detailRooms = {};
    Object.keys(rooms).forEach((roomId) => {
      detailRooms[roomId] = {};
      Object.keys(rooms[roomId]).forEach((userId) => {
        detailRooms[roomId][userId]= users[userId]

      });
    });
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

  addUser({ lineId, replyToken, roomId, displayName, pictureUrl }) {
    const store = this.store;
    store.dispatch({
      type: 'ADD_USER',
      payload: {
        user: {
          lineId,
          replyToken,
          roomId,
          displayName,
          pictureUrl
        }
      }
    });
  }

  addUserFollow({ lineId, displayName, pictureUrl }) {
    const store = this.store;
    store.dispatch({
      type: 'ADD_USER_FOLLOW',
      payload: {
        user: {
          lineId,
          displayName,
          pictureUrl
        }
      }
    });
  }

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

  extendTime({ lineId }) {
    const store = this.store;
    store.dispatch({
      type: 'EXTEND_TIME',
      payload: {
        user: {
          lineId
        }
      }
    });
  }

  broadCastAll(callback) {
    const state = this.store.getState();
    Object.keys(state.rooms || {}).forEach((roomId) => {
      Object.keys(state.rooms[roomId] || {}).forEach((key) => {
        const user = state.rooms[roomId][key];
        callback(user);
      })
    })

  }

  requestDuel({displayName, callback}) {
    const state = this.store.getState();
    let users = [];
    Object.keys(state.users || {}).forEach((userId) => {
      const user = state.users[userId];
      users.push(user);
    });

    const userTarget = users.filter(user => {
      return user.displayName == displayName;
    })[0];
    if (userTarget) {
      callback(userTarget);
    }
  }

  broadCast({roomId, callback}) {
    const state = this.store.getState();
    Object.keys(state.rooms[roomId] || {}).forEach((key) => {
      const user = state.rooms[roomId][key];
      callback(user);
    })
  }
  broadCastUsers(callback) {
    const state = this.store.getState();
    Object.keys(state.users || {}).forEach((userId) => {
      const user = state.users[userId];
      callback(user);
    })
  }
  checkUserActive(callback) {
    const state = this.store.getState();
    Object.keys(state.users).forEach((userId) => {
      const user = state.users[userId];
      if (!user.activeRoomId) return;
      const timeDiff = (Date.now() - user.lastAnswerTime) / 1000 / 60;
      if (timeDiff > 2) {
        callback(user);
      }
    });
  }

  broadCastAnswerState(callback) {
    const state = this.store.getState();
    Object.keys(state.rooms || {}).forEach((roomId) => {
      Object.keys(state.rooms[roomId] || {}).forEach((key) => {
        const user = state.rooms[roomId][key];
        const answerByUser = state.answers.filter(answer => answer.lineId == user.lineId);
        const correctAnswerByUser = state.answers.filter(answer => answer.lineId == user.lineId && answer.answerState)[0];
        
        // only show answer state after answering the first question
        if (answerByUser.length > 0) {
          if (correctAnswerByUser) {
            callback({user, answerState: true, position: correctAnswerByUser.position});
          } else {
            callback({user, answerState: false, position: 0});
          }
        }
      })
    })
  }

  listHighscore({userId, callback}) {
    const state = this.store.getState();
    const highscores = Object.keys(state.users).map((key) => {
      return state.users[key]
    }).sort((a,b) => {
      return b.score - a.score;
    })
    callback({user: {lineId: userId}, highscores});
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
    const env = process.env.NODE_ENV || 'development';
    if (Object.keys(user || {}).length > 0) {
      if (env == 'production') {
        database.ref('users/').set(user);
      } else {
        database.ref('userbaru/').set(user);
      }
    }
  }

  syncReducer({database}) {
    const store = this.store
    const state = store.getState();
    let result = null;

    const env = process.env.NODE_ENV || 'development';
    if (env == 'production') {
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
    } else {
      database.ref('userbaru').once('value').then(function(snapshot) {
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
}
