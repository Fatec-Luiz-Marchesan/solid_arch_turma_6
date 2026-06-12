
const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const NotificationModel = mongoose.model(
  'Notification',
  new Schema(
    {
      recipient: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
      channel: {
        type: String,
      },
    },
    { timestamps: true }
  )
)

module.exports = NotificationModel