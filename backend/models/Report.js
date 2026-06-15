const mongoose = require('../db/conn');
const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    reporter: {
      _id: { type: String, required: true },
      name: { type: String, default: '' },
    },
    targetType: {
      type: String,
      required: true,
      enum: ['pet', 'user', 'message'],
    },
    targetId: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'abuse', 'fraud', 'inappropriate', 'other'],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },
    moderatorNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
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

reportSchema.index({ 'reporter._id': 1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ deletedAt: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;