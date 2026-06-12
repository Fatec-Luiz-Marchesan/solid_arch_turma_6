
class User {
  constructor({ name, email, phone, password, confirmpassword }) {
    if (!name) {
      throw new Error('O nome é obrigatório!')
    }
    if (!email) {
      throw new Error('O e-mail é obrigatório!')
    }
    if (!phone) {
      throw new Error('O telefone é obrigatório!')
    }
    if (!password) {
      throw new Error('A senha é obrigatória!')
    }
    if (!confirmpassword) {
      throw new Error('A confirmação de senha é obrigatória!')
    }
    if (password !== confirmpassword) {
      throw new Error('A senha e a confirmação precisam ser iguais!')
    }

    this.name = name
    this.email = email
    this.phone = phone
    this.password = password
  }
}

module.exports = { User }