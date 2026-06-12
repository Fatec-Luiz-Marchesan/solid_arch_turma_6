const mongoose = require('mongoose')

async function main() {
  await mongoose.connect('mongodb://localhost:27017/getapetref')
  console.log('Conectou com Mongoose!')
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => console.log(err))
}

module.exports = mongoose
