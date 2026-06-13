
const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const DietModel = mongoose.model(
  'Diet',
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      pet: {
        type: String,
        required: true,
      },
      dailyCalories: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ['weight-loss', 'maintenance', 'weight-gain', 'medical'],
        default: 'maintenance',
      },
    },
    { timestamps: true }
  )
)

module.exports = DietModel