

class ProcessPayment {
  
  constructor(paymentRepository, paymentGateway) {
    this.paymentRepository = paymentRepository
    this.paymentGateway = paymentGateway
  }

  async execute({ paymentId }) {
    
    const payment = await this.paymentRepository.findById(paymentId)
    if (!payment) {
      throw new Error('Pagamento não encontrado!')
    }

    
    if (payment.status !== 'pending') {
      throw new Error('Este pagamento já foi processado!')
    }

    
    const result = await this.paymentGateway.charge({
      amount: payment.amount,
      currency: payment.currency,
    })

    
    const newStatus = result.approved ? 'paid' : 'failed'
    const updated = await this.paymentRepository.updateStatus(paymentId, newStatus)

    return updated
  }
}

module.exports = { ProcessPayment }