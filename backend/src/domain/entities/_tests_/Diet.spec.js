
const { Diet } = require('../Diet')

describe('Entidade Diet (regras de negócio)', () => {
  const makeValid = (overrides = {}) => ({
    name: 'Dieta de emagrecimento',
    pet: 'pet-id',
    dailyCalories: 350,
    type: 'weight-loss',
    ...overrides,
  })

  it('deve criar uma Diet válida', () => {
    const diet = new Diet(makeValid())
    expect(diet.name).toBe('Dieta de emagrecimento')
    expect(diet.pet).toBe('pet-id')
    expect(diet.dailyCalories).toBe(350)
    expect(diet.type).toBe('weight-loss')
  })

  it('deve lançar erro se o nome não for informado', () => {
    expect(() => new Diet(makeValid({ name: undefined })))
      .toThrow('O nome da dieta é obrigatório!')
  })

  it('deve lançar erro se o pet não for informado', () => {
    expect(() => new Diet(makeValid({ pet: undefined })))
      .toThrow('O pet é obrigatório!')
  })

  it('deve lançar erro se as calorias diárias não forem um número', () => {
    expect(() => new Diet(makeValid({ dailyCalories: 'muitas' })))
      .toThrow('As calorias diárias devem ser um número!')
  })

  it('deve lançar erro se as calorias diárias forem menores ou iguais a zero', () => {
    expect(() => new Diet(makeValid({ dailyCalories: 0 })))
      .toThrow('As calorias diárias devem ser maiores que zero!')
  })

  it('deve lançar erro se o tipo de dieta não for suportado', () => {
    expect(() => new Diet(makeValid({ type: 'inventada' })))
      .toThrow('Tipo de dieta inválido!')
  })

  it('deve usar o tipo "maintenance" por padrão quando não informado', () => {
    const diet = new Diet(makeValid({ type: undefined }))
    expect(diet.type).toBe('maintenance')
  })
})