class User {

  constructor({ id }) {
    this.lineId = id
    this.score = 0
    this.lastAnswer = ''
  }

  addPoint() {
    score++;
  }

  lastAnswer({message }) {
    lastAnswer = message
  }

}

export default User
