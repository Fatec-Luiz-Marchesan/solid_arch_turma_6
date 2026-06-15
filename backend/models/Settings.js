const mongoose = require('../db/conn');
const { Schema } = mongoose;

const ALLOWED_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const ALLOWED_TIME_FORMATS = ['12h', '24h'];
const ALLOWED_FONT_SIZES = ['small', 'medium', 'large'];

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
    dateFormat: {
      type: String,
      enum: ALLOWED_DATE_FORMATS,
      default: 'DD/MM/YYYY',
    },
    timeFormat: {
      type: String,
      enum: ALLOWED_TIME_FORMATS,
      default: '24h',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' },
      },
    },
    accessibility: {
      fontSize: { type: String, enum: ALLOWED_FONT_SIZES, default: 'medium' },
      highContrast: { type: Boolean, default: false },
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

settingsSchema.pre('save', function (next) {
  const qh = this.notifications && this.notifications.quietHours;
  if (qh && qh.enabled) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(qh.start)) {
      return next(new Error('quietHours.start deve estar no formato HH:MM!'));
    }
    if (!timeRegex.test(qh.end)) {
      return next(new Error('quietHours.end deve estar no formato HH:MM!'));
    }
  }
  next();
});

settingsSchema.statics.getDefaults = function () {
  return {
    theme: 'system',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    notifications: {
      email: true,
      push: true,
      sms: false,
      quietHours: { enabled: false, start: '22:00', end: '08:00' },
    },
    accessibility: { fontSize: 'medium', highContrast: false },
  };
};

settingsSchema.index({ 'user._id': 1 });
settingsSchema.index({ deletedAt: 1 });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
module.exports.ALLOWED_DATE_FORMATS = ALLOWED_DATE_FORMATS;
module.exports.ALLOWED_TIME_FORMATS = ALLOWED_TIME_FORMATS;
module.exports.ALLOWED_FONT_SIZES = ALLOWED_FONT_SIZES;