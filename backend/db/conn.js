const mongoose = require('mongoose')
const AppConfig = require('../infra/config')

/**
 * Por que isso mudou (Task 89 - bugfix):
 * ---------------------------------------
 * Esta task apresentou problemas e este é o conserto dela o Fix!
 */
async function connectDb() {
  await mongoose.connect(AppConfig.mongoUri)
  console.log(`Conectou com Mongoose! (${AppConfig.mongoUri})`)
}

module.exports = mongoose
module.exports.connectDb = connectDb
