const mongoose = require('../db/conn');
const { Schema } = mongoose;

const settingsSchema = new Schema(
  {
    user: {
      type: Object,
      required: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      enum: ['pt-BR', 'en-US', 'es-ES'],
      default: 'pt-BR',
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: 64,
      default: 'America/Sao_Paulo',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
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

settingsSchema.index({ 'user._id': 1 });
settingsSchema.index({ deletedAt: 1 });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;