const mongoose = require('../db/conn');
const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    // Quem está denunciando (snapshot do usuário autenticado)
    reporter: {
      type: Object,
      required: true,
    },
    // Tipo de entidade alvo da denúncia
    targetType: {
      type: String,
      required: true,
      enum: ['pet', 'user', 'message'],
    },
    // ID da entidade alvo
    targetId: {
      type: String,
      required: true,
      trim: true,
    },
    // Motivo padronizado da denúncia
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'abuse', 'fraud', 'inappropriate', 'other'],
    },
    // Texto livre explicando a denúncia
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    // Estado do fluxo de moderação
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },
    // Soft delete
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

reportSchema.index({ 'reporter._id': 1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ deletedAt: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;