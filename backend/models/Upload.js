const mongoose = require('../db/conn');
const { Schema } = mongoose;

const ALLOWED_MIMETYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
];

const FILE_CATEGORIES = ['image', 'document'];

const uploadSchema = new Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    storedName: {
      type: String,
      required: true,
      trim: true,
    },
    mimetype: {
      type: String,
      required: true,
      enum: ALLOWED_MIMETYPES,
    },
    category: {
      type: String,
      required: true,
      enum: FILE_CATEGORIES,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    path: {
      type: String,
      required: true,
    },
    uploader: {
      type: Object,
      required: true,
    },
    entity: {
      type: Object,
      default: null,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
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

uploadSchema.virtual('sizeInKB').get(function () {
  return Math.round((this.size || 0) / 1024);
});

uploadSchema.virtual('sizeInMB').get(function () {
  return parseFloat(((this.size || 0) / (1024 * 1024)).toFixed(2));
});

uploadSchema.index({ 'uploader._id': 1, createdAt: -1 });
uploadSchema.index({ 'entity.type': 1, 'entity._id': 1 });
uploadSchema.index({ deletedAt: 1 });
uploadSchema.index({ category: 1 });

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;
module.exports.ALLOWED_MIMETYPES = ALLOWED_MIMETYPES;
module.exports.FILE_CATEGORIES = FILE_CATEGORIES;