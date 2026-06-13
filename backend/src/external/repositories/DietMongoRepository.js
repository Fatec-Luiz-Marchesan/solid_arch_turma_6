
const { IDietRepository } = require('../../domain/repositories/IDietRepository')
const DietModel = require('../models/DietModel')

class DietMongoRepository extends IDietRepository {
  async create(dietData) {
    const doc = await DietModel.create(dietData)
    return {
      id: doc._id.toString(),
      name: doc.name,
      pet: doc.pet,
      dailyCalories: doc.dailyCalories,
      type: doc.type,
    }
  }

  async findAll() {
    const docs = await DietModel.find().sort('-createdAt')
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      pet: doc.pet,
      dailyCalories: doc.dailyCalories,
      type: doc.type,
    }))
  }
}

module.exports = { DietMongoRepository }