

const VALID_TYPES = ['weight-loss', 'maintenance', 'weight-gain', 'medical']

class Diet {
  constructor({ name, pet, dailyCalories, type }) {
    if (!name) {
      throw new Error('O nome da dieta é obrigatório!')
    }
    if (!pet) {
      throw new Error('O pet é obrigatório!')
    }
    if (typeof dailyCalories !== 'number' || Number.isNaN(dailyCalories)) {
      throw new Error('As calorias diárias devem ser um número!')
    }
    if (dailyCalories <= 0) {
      throw new Error('As calorias diárias devem ser maiores que zero!')
    }
    if (type && !VALID_TYPES.includes(type)) {
      throw new Error('Tipo de dieta inválido!')
    }

    this.name = name
    this.pet = pet
    this.dailyCalories = dailyCalories
    this.type = type || 'maintenance'
  }
}

module.exports = { Diet }