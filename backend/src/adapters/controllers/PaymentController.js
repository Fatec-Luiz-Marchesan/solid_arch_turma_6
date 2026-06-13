
const { CreatePayment } = require('../../use-cases/CreatePayment')
const { PaymentMongoRepository } = require('../../external/repositories/PaymentMongoRepository')
const { ProcessPayment } = require('../../use-cases/ProcessPayment')
const { FakePaymentGateway } = require('../../external/adapters/FakePaymentGateway')

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

  static async process(req, res) {
    const { id } = req.params

    const repository = new PaymentMongoRepository()
    const gateway = new FakePaymentGateway()
    const processPayment = new ProcessPayment(repository, gateway)

    try {
      const payment = await processPayment.execute({ paymentId: id })
      return res.status(200).json({
        message: 'Pagamento processado!',
        payment,
      })
    } catch (error) {
      if (error.message === 'Pagamento não encontrado!') {
        return res.status(404).json({ message: error.message })
      }
      return res.status(422).json({ message: error.message })
    }
  }


}