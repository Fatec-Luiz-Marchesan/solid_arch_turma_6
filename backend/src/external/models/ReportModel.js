const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const ReportModel = mongoose.model(
  'Report',
  new Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['abuse', 'spam', 'fraud', 'other'],
        required: true,
      },
      status: {
        type: String,
        enum: ['open', 'in_review', 'closed'],
        default: 'open',
      },
      reporterId: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  )
)

module.exports = ReportModel