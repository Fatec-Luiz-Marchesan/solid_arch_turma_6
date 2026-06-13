
const { CreatePayment } = require('../../use-cases/CreatePayment')
const { PaymentMongoRepository } = require('../../external/repositories/PaymentMongoRepository')

module.exports = class PaymentController {
 
  static async create(req, res) {
    const { payer, amount, currency } = req.body

    const repository = new PaymentMongoRepository()
    const createPayment = new CreatePayment(repository)

    try {
      const payment = await createPayment.execute({ payer, amount, currency })
      return res.status(201).json({
        message: 'Pagamento registrado com sucesso!',
        payment,
      })
    } catch (error) {
      return res.status(422).json({ message: error.message })
    }
  }
}