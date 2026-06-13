
const { ProcessPayment } = require('../ProcessPayment')

describe('ProcessPayment Use Case', () => {
  const makePaymentRepository = () => ({
    findById: jest.fn().mockResolvedValue({
      id: 'payment-id',
      payer: 'user-id',
      amount: 100.5,
      currency: 'BRL',
      status: 'pending',
    }),
    updateStatus: jest.fn().mockImplementation(async (id, status) => ({
      id,
      payer: 'user-id',
      amount: 100.5,
      currency: 'BRL',
      status,
    })),
  })

  // Gateway de pagamento injetável (porta) — Dependency Inversion / Open-Closed
  const makePaymentGateway = () => ({
    charge: jest.fn().mockResolvedValue({ approved: true, transactionId: 'tx-123' }),
  })

  const makeSut = () => {
    const paymentRepository = makePaymentRepository()
    const paymentGateway = makePaymentGateway()
    const sut = new ProcessPayment(paymentRepository, paymentGateway)
    return { sut, paymentRepository, paymentGateway }
  }

  it('deve lançar erro se o pagamento não existir', async () => {
    const { sut, paymentRepository } = makeSut()
    paymentRepository.findById.mockResolvedValue(null)

    await expect(sut.execute({ paymentId: 'inexistente' }))
      .rejects.toThrow('Pagamento não encontrado!')
  })

  it('deve lançar erro se o pagamento não estiver pendente', async () => {
    const { sut, paymentRepository } = makeSut()
    paymentRepository.findById.mockResolvedValue({
      id: 'payment-id',
      status: 'paid',
      amount: 100.5,
      currency: 'BRL',
    })

    await expect(sut.execute({ paymentId: 'payment-id' }))
      .rejects.toThrow('Este pagamento já foi processado!')
  })

  it('deve cobrar via gateway com o valor e a moeda corretos', async () => {
    const { sut, paymentGateway } = makeSut()
    await sut.execute({ paymentId: 'payment-id' })

    expect(paymentGateway.charge).toHaveBeenCalledWith({
      amount: 100.5,
      currency: 'BRL',
    })
  })

  it('deve marcar o pagamento como paid quando o gateway aprova', async () => {
    const { sut, paymentRepository } = makeSut()
    const result = await sut.execute({ paymentId: 'payment-id' })

    expect(paymentRepository.updateStatus).toHaveBeenCalledWith('payment-id', 'paid')
    expect(result.status).toBe('paid')
  })

  it('deve marcar o pagamento como failed quando o gateway recusa', async () => {
    const { sut, paymentRepository, paymentGateway } = makeSut()
    paymentGateway.charge.mockResolvedValue({ approved: false })

    const result = await sut.execute({ paymentId: 'payment-id' })

    expect(paymentRepository.updateStatus).toHaveBeenCalledWith('payment-id', 'failed')
    expect(result.status).toBe('failed')
  })
})