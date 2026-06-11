const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Message = mongoose.model(
  'Message',
  new Schema(
    {
      content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1000,
        trim: true,
      },
      sender: {
        type: Object,
        required: true,
      },
      receiver: {
        type: Object,
        required: true,
      },
      pet: {
        type: Object,
        required: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  )
);

module.exports = Message;