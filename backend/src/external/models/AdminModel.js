const mongoose = require('../../../db/conn')
const { Schema } = mongoose

const AdminModel = mongoose.model(
  'Admin',
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        default: 'admin',
      },
    },
    { timestamps: true }
  )
)

module.exports = AdminModel