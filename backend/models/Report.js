const mongoose = require('../db/conn')
const { Schema } = mongoose

/**
 * Model: Report
 *
 * Representa um reporte/denúncia enviado por um usuário autenticado
 * sobre um pet ou sobre outro usuário da plataforma. Aqui é o ponto dos dedos-duros!
 *
 * Campos:
 *   - reason       : motivo do reporte (enum controlado)
 *   - description  : detalhamento livre (obrigatório)
 *   - targetType   : tipo do alvo ('pet' | 'user')
 *   - targetId     : ObjectId do alvo (Pet ou User)
 *   - reporter     : snapshot do usuário que reportou (id + name)
 *   - status       : ciclo de vida do reporte ('open' | 'reviewing' | 'resolved' | 'dismissed')
 *   - timestamps   : createdAt / updatedAt automáticos do Mongoose
 */

const REASONS = [
  'maus-tratos',
  'informacao-falsa',
  'spam',
  'comportamento-abusivo',
  'outro',
]

const STATUS = ['open', 'reviewing', 'resolved', 'dismissed']

const ReportSchema = new Schema(
  {
    reason: {
      type: String,
      required: true,
      enum: REASONS,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['pet', 'user'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reporter: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    status: {
      type: String,
      enum: STATUS,
      default: 'open',
    },
  },
  { timestamps: true },
)

const Report = mongoose.model('Report', ReportSchema)

module.exports = { Report, REASONS, STATUS }
