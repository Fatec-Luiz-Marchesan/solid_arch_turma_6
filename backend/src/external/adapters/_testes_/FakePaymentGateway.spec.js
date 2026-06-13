
const { FakePaymentGateway } = require('../FakePaymentGateway')

describe('FakePaymentGateway', () => {
  const makeSut = () => new FakePaymentGateway()

  it('deve aprovar a cobrança quando o valor é positivo', async () => {
    const sut = makeSut()

    const result = await sut.charge({ amount: 100.5, currency: 'BRL' })

    expect(result.approved).toBe(true)
    expect(result.transactionId).toBeDefined()
    expect(result.currency).toBe('BRL')
  })

  it('deve recusar a cobrança quando o valor não é positivo', async () => {
    const sut = makeSut()

    const result = await sut.charge({ amount: 0, currency: 'BRL' })

    expect(result.approved).toBe(false)
  })
})