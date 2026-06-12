const mongoose = require('../db/conn');
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1000000,
    },
    currency: {
      type: String,
      required: true,
      enum: ['BRL', 'USD', 'EUR'],
      default: 'BRL',
      uppercase: true,
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
    transactionId: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
    
          if (!v) return true;
          return /^[A-Za-z0-9-]{8,50}$/.test(v);
        },
        message: 'transactionId deve ser alfanumérico entre 8 e 50 caracteres!',
      },
    },
    processedAt: {
      type: Date,
      default: null,
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
);

paymentSchema.index({ 'payer._id': 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;