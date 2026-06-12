const VALID_TYPES = ['abuse', 'spam', 'fraud', 'other']

class Report {
  constructor({ title, description, type, status, reporterId }) {
    if (!title) {
      throw new Error('O título do report é obrigatório!')
    }
    if (!description) {
      throw new Error('A descrição do report é obrigatória!')
    }
    if (!type || !VALID_TYPES.includes(type)) {
      throw new Error('Tipo de report inválido!')
    }
    if (!reporterId) {
      throw new Error('O autor do report é obrigatório!')
    }
   
    this.title = title
    this.description = description
    this.type = type
    // Regra de negócio: todo report nasce "open"
    this.status = status || 'open'
    this.reporterId = reporterId
  }
}

module.exports = { Report, VALID_TYPES }