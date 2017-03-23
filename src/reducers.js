import uuid from 'uuid';
import questionList from './questionList';

const initialState = {
  questions: questionList,
  timer: 5,
  activeQuestion: {
    correctCounter: 0
  },
  rooms: {},
  answers: [],
  users: {},
}

export default function questions(state = initialState, action) {
  const {payload} = action;
  switch (action.type) {
    case 'TICK_TIMER':
      return {
        ...state,
        timer: payload.timer,
      };
    case 'CHANGE_ACTIVE_QUESTION':
      return {
        ...state,
        activeQuestion: {
          ...payload.activeQuestion,
          correctCounter: 0
        },
        questionId: uuid.v4(),
        answers: []
      };
    case 'CREATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.hasOwnProperty(payload.roomId) ? state.rooms : {
          ...state.rooms,
          [payload.roomId]: {}
        }
      }
    case 'ANSWER':
      return {
        ...state,
        activeQuestion: {
          ...state.activeQuestion,
          correctCounter: payload.correctCounter
        },
        answers: [
          ...state.answers,
          {
            position: state.answers.length,
            lineId: payload.user.lineId,
            addedScore: payload.answer.addedScore,
            answerText: payload.answer.text,
            answerState: payload.answer.state,
            roomId : payload.roomId,
            displayName: payload.user.displayName
          }
        ],
        users: {
          ...state.users,
          [payload.user.lineId]: {
              ...state.users[payload.user.lineId],
              score: payload.user.score,
              lastAnswerTime: Date.now()
          }
        }
      }
    case 'REMOVE_USER':
      var updateRoom = {};
      Object.keys(state.rooms || {}).forEach((roomId) => {
        updateRoom[roomId] = {};
        Object.keys(state.rooms[roomId] || {}).forEach((userId) => {
          const user = state.rooms[roomId][userId];
          if (user.lineId != payload.user.lineId) {
            updateRoom[roomId][userId] = user;
          }
        });
      });
      const newState = {
        ...state,
        rooms: updateRoom
      };
      return newState;
    case 'ADD_USER':
      var updateRoom = {
        ...state.rooms[payload.user.roomId],
        [payload.user.lineId]: {
          lineId: payload.user.lineId
        }
      };
      var newState = {
        ...state,
        rooms: {
          ...state.rooms,
          [payload.user.roomId]: updateRoom
        },
        users:{
          ...state.users,
          [payload.user.lineId]: {
            lineId: payload.user.lineId,
            replyToken: payload.user.replyToken,
            score: state.users[payload.user.lineId] && state.users[payload.user.lineId].score ? state.users[payload.user.lineId].score : 0 ,
            displayName: payload.user.displayName,
            activeRoomId: payload.user.roomId,
            lastAnswerTime: Date.now()
          }
        }
      }
      return newState;
    case 'EXTEND_TIME':
      return {
        ...state,
        users: {
          ...state.users,
          [payload.user.lineId]: {
            ...state.users[payload.user.lineId],
            lastAnswerTime: Date.now()
          }
        }
      };
    case 'SYNC':
      var newState = {
        ...state,
        users: payload.users
      }

      return newState;
    default:
      return state
  }
}
