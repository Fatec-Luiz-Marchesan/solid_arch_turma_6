const mongoose = require('../db/conn');
const { Schema } = mongoose;

const breedSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    species: {
      type: String,
      required: true,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'other'],
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    temperament: {
      type: [String],
      default: [],
    },
    lifeExpectancy: {
      type: Number,
      min: 0,
      max: 50,
      default: null,
    },
    origin: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    hypoallergenic: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

breedSchema.index({ species: 1 });
breedSchema.index({ deletedAt: 1 });
breedSchema.index({ name: 1 });

const Breed = mongoose.model('Breed', breedSchema);

module.exports = Breed;