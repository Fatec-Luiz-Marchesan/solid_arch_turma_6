const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    // GeoJSON para consultas geoespaciais nativas do MongoDB
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
  },
  { timestamps: true }
)

locationSchema.index({ geo: '2dsphere' })

const LocationModel = mongoose.model('Location', locationSchema)

module.exports = LocationModel