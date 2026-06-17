/**
 * Use Case: CreateReport - aqui pra criar os report!
 *
 * Regra de negócio: um usuário autenticado abre um reporte sobre um pet
 * ou outro usuário. Não pode reportar a si mesmo.
 *
 * Não conhece Express (req/res) - recebe dados já validados pelo Controller
 * e devolve o documento criado ou lança um Error com mensagem de negócio.
 */

const { Report } = require('../models/Report')
const ObjectId = require('mongoose').Types.ObjectId

class CreateReport {
  /**
   * @param {object} data
   * @param {string} data.reason       - motivo (enum de Report.REASONS)
   * @param {string} data.description  - texto livre (10-1000 chars)
   * @param {string} data.targetType   - 'pet' | 'user'
   * @param {string} data.targetId     - ObjectId do alvo (string)
   * @param {object} data.reporter     - { _id, name } do usuário autenticado
   */
  async execute({ reason, description, targetType, targetId, reporter }) {
    // Não pode reportar a si mesmo
    if (
      targetType === 'user' &&
      reporter._id.toString() === targetId.toString()
    ) {
      throw new Error('Você não pode reportar a si mesmo.') // como assim você está tentando reportar a si mesmo?! Duuhh!
    }
// aqui estão os detalhes do report
    const report = new Report({
      reason,
      description,
      targetType,
      targetId: new ObjectId(targetId),
      reporter: {
        _id: reporter._id,
        name: reporter.name,
      },
    })

    return report.save()
  }
}
//E aqui o module.exports, sempre tem em react, se não a coisa não funciona!
module.exports = new CreateReport()
