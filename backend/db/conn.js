const mongoose = require('mongoose')

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/getapetref'

async function main() {
  await mongoose.connect(MONGO_URL)
  console.log('Conectou com Mongoose!')
}


if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => console.log(err))
}

module.exports = mongoose