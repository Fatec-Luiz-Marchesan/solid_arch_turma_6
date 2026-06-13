
const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const NotificationModel = mongoose.model(
  'Notification',
  new Schema(
    {
      recipientId: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal',
      },
      read: {
        type: Boolean,
        default: false,
      },
      expiresAt: {
        type: Date,
        default: null
      },
    },
    { timestamps: true }
  )
)

module.exports = NotificationModel