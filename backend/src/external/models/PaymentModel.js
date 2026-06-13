
const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const PaymentModel = mongoose.model(
  'Payment',
  new Schema(
    {
      payer: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
        enum: ['BRL', 'USD', 'EUR'],
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
    },
    { timestamps: true }
  )
)

module.exports = PaymentModel