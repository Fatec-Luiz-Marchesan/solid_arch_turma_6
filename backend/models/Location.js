const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Location = mongoose.model(
  'Location',
  new Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 100 },
      street: { type: String, required: true, trim: true },
      number: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, match: /^[A-Z]{2}$/ },
      zipCode: { type: String, required: true, match: /^\d{5}-?\d{3}$/ },
      country: { type: String, default: 'Brasil', trim: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      user: { type: Object, required: true },
      isPrimary: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

module.exports = Location;