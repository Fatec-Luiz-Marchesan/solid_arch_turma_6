const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const EventModel = mongoose.model(
  'Event',
  new Schema(
    {
      title: {
        type: String,
        required: true,
      },
      startsAt: {
        type: Date,
        required: true,
      },
      endsAt: {
        type: Date,
        required: true,
      },
      organizerId: {
        type: String,
        required: true,
      },
      // Novos campos (Open/Closed: defaults seguros não quebram docs antigos)
      location: {
        type: String,
        default: '',
      },
      capacity: {
        type: Number,
        default: 1,
        min: [1, 'A capacidade mínima do evento é 1!'],
      },
    },
    { timestamps: true }
  )
)

module.exports = EventModel