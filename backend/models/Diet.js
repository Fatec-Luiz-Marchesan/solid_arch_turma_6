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
    mealsPerDay: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || Number.isInteger(v);
        },
        message: 'mealsPerDay deve ser um número inteiro!',
      },
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

const Diet = mongoose.model('Diet', dietSchema);

module.exports = Diet;
