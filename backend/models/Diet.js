const mongoose = require('../db/conn');
const { Schema } = mongoose;

const dietSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ['weight-loss', 'weight-gain', 'maintenance', 'high-protein', 'low-carb', 'vegan', 'other'],
    },
    goal: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    dailyCalories: {
      type: Number,
      min: 0,
      max: 10000,
      default: null,
    },
    durationDays: {
      type: Number,
      min: 1,
      max: 3650,
      default: null,
    },
    restrictions: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    mealFrequency: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    pet: {
      type: Object,
      default: null,
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

dietSchema.index({ type: 1 });
dietSchema.index({ deletedAt: 1 });
dietSchema.index({ name: 1 });
dietSchema.index({ startDate: 1 });
dietSchema.index({ 'user._id': 1, deletedAt: 1 });

const Diet = mongoose.model('Diet', dietSchema);

module.exports = Diet;
