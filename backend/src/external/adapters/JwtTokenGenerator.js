const jwt = require('jsonwebtoken')

class JwtTokenGenerator {
  constructor(secret = 'nossosecret') {
    this.secret = secret
  }

  generate(payload) {
    return jwt.sign(payload, this.secret)
  }
}

module.exports = { JwtTokenGenerator }