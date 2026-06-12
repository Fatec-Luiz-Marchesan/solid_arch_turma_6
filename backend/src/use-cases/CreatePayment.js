
const { Payment } = require('../domain/entities/Payment')

class CreatePayment {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository
  }

  async execute({ payer, amount, currency }) {
    
    const payment = new Payment({ payer, amount, currency })

    
    const created = await this.paymentRepository.create({
      payer: payment.payer,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
    })

    return created
  }
}

module.exports = { CreatePayment }