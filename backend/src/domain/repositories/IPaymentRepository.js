
class IPaymentRepository {
  
  async create(paymentData) {
    throw new Error('Método create não implementado')
  }

  async findAll() {
    throw new Error('Método findAll não implementado')
  }

   async findById(id) {
    throw new Error('Método findById não implementado')
  }

  
  async updateStatus(id, status) {
    throw new Error('Método updateStatus não implementado')
  }

}

module.exports = { IPaymentRepository }