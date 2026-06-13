class AdminValidator {
  static validateCreate(body) {
    if (!body || typeof body !== 'object') {
      return 'Corpo da requisição inválido!'
    }
    const { email, password } = body

    if (email !== undefined && typeof email !== 'string') {
      return 'O email deve ser um texto!'
    }
    if (password !== undefined && typeof password !== 'string') {
      return 'A senha deve ser um texto!'
    }
    return null
  }
}

module.exports = { AdminValidator }