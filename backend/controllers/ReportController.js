/**
 * ReportController
 *
 * Camada HTTP (tratamento de req/res).
 * Não contém regra de negócio - delega tudo para os Use Cases.
 * Responsável apenas por:
 *   1. Extrair e validar dados da requisição (obrigatoriedade, formato).
 *   2. Chamar o Use Case correspondente.
 *   3. Formatar a resposta HTTP.
 *
 * Clean Architecture: Controller → Use Case → Model
 */

const { REASONS } = require('../models/Report')
const ObjectId = require('mongoose').Types.ObjectId

// Use Cases
const createReport        = require('../usecases/CreateReport')
const listReports         = require('../usecases/ListReports')
const updateReportStatus  = require('../usecases/UpdateReportStatus')

// Helpers existentes (mesma abordagem do PetController)
const getToken        = require('../helpers/get-token')
const getUserByToken  = require('../helpers/get-user-by-token')

module.exports = class ReportController {
  // POST /reports
  static async create(req, res) {
    try {
      const { reason, description, targetType, targetId } = req.body

      // --- validações de entrada (responsabilidade do Controller) ---
      if (!reason) {
        return res.status(422).json({ message: 'O motivo é obrigatório.' })
      }

      if (!REASONS.includes(reason)) {
        return res.status(422).json({
          message: `Motivo inválido. Valores aceitos: ${REASONS.join(', ')}.`,
        })
      }

      if (!description || description.trim().length < 10) {
        return res.status(422).json({
          message: 'A descrição é obrigatória e deve ter no mínimo 10 caracteres. Você está tentando fazer um Tweet?',
        })
      }

      if (description.trim().length > 1000) {
        return res.status(422).json({
          message: 'A descrição deve ter no máximo 1000 caracteres. é uma denúncia e não um textão do facebook!',
        })
      }

      if (!targetType || !['pet', 'user'].includes(targetType)) {
        return res.status(422).json({
          message: "O tipo do alvo é obrigatório e deve ser 'pet' ou 'user'. Você tem que denunciar alguém, não o vazio!",
        })
      }

      if (!targetId || !ObjectId.isValid(targetId)) {
        return res.status(422).json({ message: 'O ID do alvo é inválido. Você está reportando certo?' })
      }

      // --- usuário autenticado (via token, mesmo padrão do PetController) ---
      const token = getToken(req)
      const user  = await getUserByToken(token)

      // --- delega a regra de negócio ao Use Case ---
      const report = await createReport.execute({
        reason,
        description: description.trim(),
        targetType,
        targetId,
        reporter: { _id: user._id, name: user.name },
      })

      return res.status(201).json({
        message: 'Reporte enviado com sucesso!',
        report,
      })
    } catch (err) {
      const status = err.message === 'Você não pode reportar a si mesmo. Que raios você está tentando?' ? 422 : 500
      return res.status(status).json({ message: err.message })
    }
  }

  // GET /reports
  static async getAll(req, res) {
    try {
      const { targetType, targetId, status } = req.query
      const filters = {}

      // Defesa em profundidade: req.query pode conter arrays/objetos se o
      // usuário mandar querystring "exótica" (ex: ?targetType[$ne]=null).
      // Só repassamos o filtro se ele for uma string simples - qualquer
      // outra coisa é descartada aqui. O Use Case (ListReports) também
      // valida contra os enums, então a checagem é redundante de propósito.
      if (typeof targetType === 'string') filters.targetType = targetType
      if (typeof targetId === 'string')   filters.targetId   = targetId
      if (typeof status === 'string')     filters.status     = status

      const reports = await listReports.execute(filters)

      return res.status(200).json({ reports })
    } catch (err) {
      console.error("DEBUG_ERRO_500:", error);
      return res.status(500).json({ message: err.message })
    }
  }

  // PATCH /reports/:id/status
  static async updateStatus(req, res) {
    try {
      const { id }     = req.params
      const { status } = req.body

      if (!status) {
        return res.status(422).json({ message: 'O status é obrigatório.' })
      }

      const report = await updateReportStatus.execute(id, status)

      return res.status(200).json({
        message: 'Status atualizado com sucesso!',
        report,
      })
    } catch (err) {
      const notFound = err.message === 'Reporte não encontrado.'
      const invalid  = err.message.startsWith('Status inválido') ||
                       err.message === 'ID de reporte inválido.'
      const status   = notFound ? 404 : invalid ? 422 : 500
      return res.status(status).json({ message: err.message })
    }
  }
}
