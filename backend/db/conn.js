const mongoose = require('mongoose')
const AppConfig = require('../infra/config')

async function main() {
  await mongoose.connect(AppConfig.mongoUri)
  console.log(`Conectou com Mongoose! (${AppConfig.mongoUri})`)
}

main().catch((err) => console.log(err))

module.exports = mongoose
