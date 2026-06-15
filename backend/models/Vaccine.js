const mongoose = require('mongoose')
const { Schema } = mongoose

const vaccineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    manufacturer: { type: String, trim: true, maxlength: 100, default: null },
    batchNumber: { type: String, trim: true, maxlength: 50, default: null },
    applicationDate: { type: Date, required: true },
    nextDueDate: { type: Date, default: null },
    dose: { type: Number, min: 1, max: 20, default: 1 },
    status: {
      type: String,
      enum: ['applied', 'scheduled', 'overdue'],
      default: 'applied',
    },
    veterinarian: { type: String, trim: true, maxlength: 100, default: null },
    notes: { type: String, trim: true, maxlength: 1000, default: null },
    clinicName: { type: String, trim: true, maxlength: 150, default: null },
    location: { type: String, trim: true, maxlength: 200, default: null },
    expirationDate: { type: Date, default: null },
    serialNumber: { type: String, trim: true, maxlength: 50, default: null },
    pet: { type: Object, required: true },
    user: { type: Object, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

vaccineSchema.index({ 'pet._id': 1, deletedAt: 1 })
vaccineSchema.index({ 'user._id': 1, deletedAt: 1 })
vaccineSchema.index({ applicationDate: -1 })
vaccineSchema.index({ nextDueDate: 1 })
vaccineSchema.index({ 'user._id': 1, status: 1 })

const Vaccine = mongoose.model('Vaccine', vaccineSchema)

module.exports = Vaccine
