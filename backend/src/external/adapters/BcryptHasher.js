const bcrypt = require('bcrypt')

class BcryptHasher {
  constructor(salt = 10) {
    this.salt = salt
  }

  async hash(plainText) {
    return bcrypt.hash(plainText, this.salt)
  }

  async compare(plainText, hash) {
    return bcrypt.compare(plainText, hash)
  }
}

module.exports = { BcryptHasher }