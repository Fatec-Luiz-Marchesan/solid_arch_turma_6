const mongoose = require('../db/conn');
const { Schema } = mongoose;

const NOTIFICATION_TYPES = [
  'message_received',
  'payment_completed',
  'payment_refunded',
  'pet_adopted',
  'pet_interest',
  'account_update',
  'system',
];

const CHANNELS = ['in_app', 'email', 'push'];
const STATUSES = ['unread', 'read', 'archived', 'dismissed'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: NOTIFICATION_TYPES,
    },
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 200,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
      trim: true,
    },
    recipient: {
      type: Object,
      required: true,
    },
    sender: {
      type: Object,
      default: null,
    },
    relatedEntity: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'unread',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'normal',
    },
    channels: {
      type: [String],
      default: ['in_app'],
      validate: {
        validator: function (arr) {
          if (!Array.isArray(arr) || arr.length === 0) return false;
          return arr.every((c) => CHANNELS.includes(c));
        },
        message: 'Canais inválidos!',
      },
    },
    metadata: {
      type: Object,
      default: {},
    },
    actionUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined || v === '') return true;
          return /^(https?:\/\/|\/)[^\s]*$/.test(v);
        },
        message: 'actionUrl deve ser uma URL http(s) ou caminho relativo válido!',
      },
    },
    readAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ 'recipient._id': 1, status: 1, createdAt: -1 });
notificationSchema.index({ 'recipient._id': 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
module.exports.CHANNELS = CHANNELS;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;