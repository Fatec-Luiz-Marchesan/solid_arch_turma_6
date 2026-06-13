
const { CreateDiet } = require('../../use-cases/CreateDiet')
const { DietMongoRepository } = require('../../external/repositories/DietMongoRepository')

module.exports = class DietController {
  
  static async create(req, res) {
    const { name, pet, dailyCalories, type } = req.body

    const repository = new DietMongoRepository()
    const createDiet = new CreateDiet(repository)

    try {
      const diet = await createDiet.execute({ name, pet, dailyCalories, type })
      return res.status(201).json({
        message: 'Dieta cadastrada com sucesso!',
        diet,
      })
    } catch (error) {
      return res.status(422).json({ message: error.message })
    }
  }
}