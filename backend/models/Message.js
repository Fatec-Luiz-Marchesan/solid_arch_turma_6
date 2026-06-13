const mongoose = require('../db/conn');
const { Schema } = mongoose;

const messageSchema = new Schema(
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
   
    readAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ 'receiver._id': 1, read: 1 });
messageSchema.index({ deletedAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;