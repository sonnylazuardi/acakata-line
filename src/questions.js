export default class Questions {
  constructor(store) {
    this.store = store;
    this.questionTimeout = null;
    this.timerCount = 25;
  }

  shuffle(str) {
    var a = str.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
  }

  randomize() {
    const state = this.store.getState();
    const randInt = Math.floor(Math.random() * state.questions.length);
    const activeQuestion = { 
      ...state.questions[randInt],
      randomAnswer: this.shuffle(state.questions[randInt].answer)
    };
    return activeQuestion;
  }

  start() {
    const store = this.store;
    if (!this.questionTimeout) {
      console.log('START QUESTION TIMEOUT');
      this.questionTimeout = setInterval(() => {
        const state = store.getState();
        let nextTimer = state.timer - 1;
        if (nextTimer < 0) {
          nextTimer = this.timerCount;
          store.dispatch({
            type: 'CHANGE_ACTIVE_QUESTION',
            payload: {
              activeQuestion: this.randomize()
            }
          });
        }
        store.dispatch({
          type: 'TICK_TIMER',
          payload: {
            timer: nextTimer
          }
        });
      }, 1000);
    }
  }

  getTimer() {
    const store = this.store;
    const state = store.getState();
    return state.timer;
  }

  checkAnswer({answerText, lineId, roomId}) {
    const store = this.store;
    const state = store.getState();
    let currentUser = state.rooms[roomId][lineId];

    console.log('CHECK ANSWER', state.activeQuestion);

    let correctCounter = state.activeQuestion.correctCounter;
    let answer = {
      text: answerText,
      addedScore: 0,
    };

    const myCurrentAnswer = state.answers.filter(answer => {
      return answer.lineId == lineId && answer.answerState;
    });

    if (myCurrentAnswer.length > 0) return;

    if (state.activeQuestion.answer.toLowerCase() == answerText.toLowerCase()) {
      correctCounter++;
      switch (correctCounter) {
        case 1:
          answer.addedScore = 10;
          break;
        case 2:
          answer.addedScore = 5;
          break;
        case 3:
        case 4:
        case 5:
          answer.addedScore = 1;
          break;
      }
      currentUser.score += answer.addedScore;
      answer.state = true;
    } else {
      answer.state = false;
    }

    store.dispatch({
      type: 'ANSWER',
      payload: {
        answer: answer,
        user: currentUser,
        correctCounter: correctCounter
      }
    })
  }

  stop() {
    clearInterval(this.questionTimeout);
    this.questionTimeout = null;
  }
}


// > Ibukota negara Indonesia
// > SAIDONNIA

// > A: Indonesa
//  salah
// > B: Indonesia
//  B + 10
// > A: Indonesia
//  A + 5
// > C: Indonesia
//  C + 1
// > D: Indonesia
//  D + 1
// > E: Indonesia
//  D + 1
// > F: Indonesia
//  F + 0

// ---

// > A menjawab salah
// > B menjawab benar + 10
// > A menjawab Indonesia + 1
// > C menjawab Indonesia + 1


// High score sementara
// - B:


// - Menu Utama
//   > minta nickname

//   - start
//     > muncul pertanyaan
//     > lawan semua yang online

//   - duel
//     > nickname musuh
//       > musuh dapet message duel (timeout 30 detik)
//         > accept
//           > muncul pertanyaan

//   - score
//     > High score
//     > score dia skr

