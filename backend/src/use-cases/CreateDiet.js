
const { Diet } = require('../domain/entities/Diet')

class CreateDiet {
  constructor(dietRepository) {
    this.dietRepository = dietRepository
  }

  async execute({ name, pet, dailyCalories, type }) {
    
    const diet = new Diet({ name, pet, dailyCalories, type })

    const created = await this.dietRepository.create({
      name: diet.name,
      pet: diet.pet,
      dailyCalories: diet.dailyCalories,
      type: diet.type,
    })

    return created
  }
}

module.exports = { CreateDiet }