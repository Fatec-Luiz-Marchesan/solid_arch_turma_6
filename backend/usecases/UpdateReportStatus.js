/**
 * Use Case: UpdateReportStatus
 *
 * Atualiza o status de um reporte existente. Para saber o stauts dele né Duuh!!
 * Regra: só aceita transições para os valores do enum STATUS. Não tente de outro jeito
 *
 * Não conhece Express (req/res). Então não adianta você usar requisições!
 */

const { Report, STATUS } = require('../models/Report')
const ObjectId = require('mongoose').Types.ObjectId

class UpdateReportStatus {
  /**
   * @param {string} reportId  - ObjectId string do reporte
   * @param {string} status    - novo status (enum STATUS)
   */

  // Aqui começa os If's async para cada caso de report!
  async execute(reportId, status) {
    if (!ObjectId.isValid(reportId)) {
      throw new Error('ID de reporte inválido. Você realmente lembra o id?')
    }

    if (!STATUS.includes(status)) {
      throw new Error(`Status inválido. Valores aceitos: ${STATUS.join(', ')}.`)
    }

    const report = await Report.findById(reportId)
    if (!report) {
      throw new Error('Reporte não encontrado. Você está procurando certo?')
    }

    report.status = status
    return report.save()
  }
}

//E aqui o export module que você não pode esquecer!
module.exports = new UpdateReportStatus()
