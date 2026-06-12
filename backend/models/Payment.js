const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Payment = mongoose.model(
  'Payment',
  new Schema(
    {
      amount: {
        type: Number,
        required: true,
        min: 0.01,
      },
      method: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'pix', 'cash'],
      },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'refunded'],
        default: 'pending',
      },
      payer: {
        type: Object,
        required: true,
      },
      pet: {
        type: Object,
        required: true,
      },
      description: {
        type: String,
        maxlength: 500,
        trim: true,
      },
    },
    { timestamps: true }
  )
);

module.exports = Payment;