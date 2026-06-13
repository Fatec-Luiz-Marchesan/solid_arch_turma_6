
const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR']
const VALID_STATUSES = ['pending', 'paid', 'failed', 'refunded']

class Payment {
  constructor({ payer, amount, currency, status }) {
    if (!payer) {
      throw new Error('O pagador é obrigatório!')
    }
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      throw new Error('O valor deve ser um número!')
    }
    if (amount <= 0) {
      throw new Error('O valor deve ser maior que zero!')
    }
    if (!currency || !SUPPORTED_CURRENCIES.includes(currency)) {
      throw new Error('Moeda não suportada!')
    }
    if (status && !VALID_STATUSES.includes(status)) {
      throw new Error('Status de pagamento inválido!')
    }

    this.payer = payer
    this.amount = amount
    this.currency = currency
    this.status = status || 'pending'
  }
}

module.exports = { Payment }