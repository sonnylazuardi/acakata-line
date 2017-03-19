import uuid from 'uuid';
import questionList from './questionList';

const initialState = {
  questions: questionList,
  timer: 5,
  activeQuestion: {
    correctCounter: 0
  },
  rooms: {},
  answers: []
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
            lineId: payload.user.lineId,
            displayName: payload.user.displayName,
            addedScore: payload.answer.addedScore,
            answerText: payload.answer.text,
            answerState: payload.answer.state
          }
        ],
        rooms: {
          ...state.rooms,
          [payload.user.roomId]: {
            ...state.rooms[payload.user.roomId],
            [payload.user.lineId]: {
              score: payload.user.score
            }
          }
        }
      }
    case 'REMOVE_USER':
      var updateRoom = Object.keys(state.rooms[payload.user.roomId]).filter(key => {
        return key != payload.user.lineId;
      }).reduce((acc, key) => {
        return {
          ...acc,
          [key]: state.rooms[payload.user.roomId][key]
        };
      }, {});
      var newState = {
        ...state,
        rooms: {
          ...state.rooms,
          [payload.user.roomId]: updateRoom
        }
      }
      return newState;
    case 'ADD_USER':
      var updateRoom = {
        ...state.rooms[payload.user.roomId],
        [payload.user.lineId]: {
          lineId: payload.user.lineId,
          replyToken: payload.user.replyToken,
          score: 0,
          displayName: payload.user.displayName
        }
      };
      var newState = {
        ...state,
        rooms: {
          ...state.rooms,
          [payload.user.roomId]: updateRoom
        }
      }
      return newState;
    case 'SYNC':
      var updateRoom = {
        ...state.rooms[payload.user.roomId],
        [payload.user.lineId]: {
          lineId: payload.user.lineId,
          replyToken: payload.user.replyToken,
          score: payload.user.score,
          displayName: payload.user.displayName
        }
      };

      var newState = {
        ...state,
        rooms: {
          ...state.rooms,
          [payload.user.roomId]: updateRoom
        }
      }
      console.log(newState.rooms.test)
      return newState;
    default:
      return state
  }
}
