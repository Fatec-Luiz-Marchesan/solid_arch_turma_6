/**
 * Use Case: ListReports aqui mostra todos os reports do site neste
 * caso mostra todas as denúncias feitas pelos usuários
 * Retorna todos os reportes do banco, ordenados pelo mais recente.
 * Filtragem opcional por targetType, targetId e status (passados como
 * objeto de filtros). A filtragem é só pra ajudar um pouquinho a facilitar
 *
 * Não conhece Express (req/res).
 */

const { Report, STATUS } = require('../models/Report')
const ObjectId = require('mongoose').Types.ObjectId

const TARGET_TYPES = ['pet', 'user']

// Só aceita um valor se ele for uma string "primitiva" String das cavernas (não array, não
// objeto lembra das aulas de ED?) - é essa checagem que neutraliza payloads como {$ne: ...}.
const isPlainString = (value) => typeof value === 'string'

class ListReports {
  /**
   * @param {object} [filters]
   * @param {string} [filters.targetType]  - 'pet' | 'user'
   * @param {string} [filters.targetId]    - ObjectId string
   * @param {string} [filters.status]      - 'open' | 'reviewing' | 'resolved' | 'dismissed'
   */
  async execute(filters = {}) {
    const query = {}

    if (
      isPlainString(filters.targetType) &&
      TARGET_TYPES.includes(filters.targetType)
    ) {
      query.targetType = filters.targetType
    }

    if (isPlainString(filters.targetId) && ObjectId.isValid(filters.targetId)) {
      query.targetId = new ObjectId(filters.targetId)
    }

    if (isPlainString(filters.status) && STATUS.includes(filters.status)) {
      query.status = filters.status
    }

    // .lean() transforma o retorno em objetos JS puros, eliminando lixo de memória do Mongoose nos testes
    // Ehhh saudade do Freeman do C! Mas fazer o quê! Tem que usar ele garbage collector mesmo!
    return Report.find(query).sort({ createdAt: -1 }).lean()
  }
}

// Exportando a classe para manter o padrão correto da Clean Arch (tá mais pra "Frescura Arch")
module.exports = new ListReports()