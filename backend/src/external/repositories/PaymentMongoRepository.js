
const { IPaymentRepository } = require('../../domain/repositories/IPaymentRepository')
const PaymentModel = require('../models/PaymentModel')

class PaymentMongoRepository extends IPaymentRepository {
  async create(paymentData) {
    const doc = await PaymentModel.create(paymentData)
    return {
      id: doc._id.toString(),
      payer: doc.payer,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
    }
  }

  async findAll() {
    const docs = await PaymentModel.find().sort('-createdAt')
    return docs.map((doc) => ({
      id: doc._id.toString(),
      payer: doc.payer,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
    }))
  }
}

module.exports = { PaymentMongoRepository }