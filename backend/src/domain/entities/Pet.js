class Pet {
  constructor({
    name,
    age,
    weight,
    color,
    images,
    description,
    available,
    user,
    adopter,
  }) {
    if (!name) {
      throw new Error('O nome é obrigatório!')
    }
    if (age === undefined || age === null || age === '') {
      throw new Error('A idade é obrigatória!')
    }
    if (weight === undefined || weight === null || weight === '') {
      throw new Error('O peso é obrigatório!')
    }
    if (!color) {
      throw new Error('A cor é obrigatória!')
    }
    if (!images || images.length === 0) {
      throw new Error('A imagem é obrigatória!')
    }
    this.name = name
    this.age = age
    this.weight = weight
    this.color = color
    this.images = images
    this.description = description
    this.available = available === undefined ? true : available
    this.user = user
    this.adopter = adopter
  }
}

module.exports = { Pet }