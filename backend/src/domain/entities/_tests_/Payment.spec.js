
const { Payment } = require('../Payment')

describe('Entidade Payment (regras de negócio)', () => {
  const makeValid = (overrides = {}) => ({
    payer: 'user-id',
    amount: 100.5,
    currency: 'BRL',
    ...overrides,
  })

  it('deve criar um Payment válido com status pending por padrão', () => {
    const payment = new Payment(makeValid())
    expect(payment.payer).toBe('user-id')
    expect(payment.amount).toBe(100.5)
    expect(payment.currency).toBe('BRL')
    expect(payment.status).toBe('pending')
  })

  it('deve lançar erro se o pagador não for informado', () => {
    expect(() => new Payment(makeValid({ payer: undefined })))
      .toThrow('O pagador é obrigatório!')
  })

  it('deve lançar erro se o valor não for um número', () => {
    expect(() => new Payment(makeValid({ amount: 'abc' })))
      .toThrow('O valor deve ser um número!')
  })

  it('deve lançar erro se o valor for menor ou igual a zero', () => {
    expect(() => new Payment(makeValid({ amount: 0 })))
      .toThrow('O valor deve ser maior que zero!')
  })

  it('deve lançar erro se a moeda não for suportada', () => {
    expect(() => new Payment(makeValid({ currency: 'XYZ' })))
      .toThrow('Moeda não suportada!')
  })

  it('deve lançar erro se o status informado for inválido', () => {
    expect(() => new Payment(makeValid({ status: 'voando' })))
      .toThrow('Status de pagamento inválido!')
  })
})