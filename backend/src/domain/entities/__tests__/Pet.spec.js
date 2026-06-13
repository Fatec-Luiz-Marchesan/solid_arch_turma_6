const { Pet } = require('../Pet')

describe('Entidade Pet (regras de domínio)', () => {
  const makeValidData = (overrides = {}) => ({
    name: 'Rex',
    age: 2,
    weight: 8,
    color: 'preto',
    images: ['rex.jpg'],
    user: { _id: 'u1', name: 'Dono' },
    ...overrides,
  })

  it('deve criar um Pet válido com os dados corretos', () => {
    const pet = new Pet(makeValidData())
    expect(pet.name).toBe('Rex')
    expect(pet.age).toBe(2)
    expect(pet.weight).toBe(8)
    expect(pet.color).toBe('preto')
  })
  it('deve nascer disponível para adoção por padrão', () => {
    const pet = new Pet(makeValidData())
    expect(pet.available).toBe(true)
  })

  it('deve lançar erro se o nome não for informado', () => {
    expect(() => new Pet(makeValidData({ name: undefined })))
      .toThrow('O nome é obrigatório!')
  })

  it('deve lançar erro se a idade não for informada', () => {
    expect(() => new Pet(makeValidData({ age: undefined })))
      .toThrow('A idade é obrigatória!')
  })

  it('deve lançar erro se o peso não for informado', () => {
    expect(() => new Pet(makeValidData({ weight: undefined })))
      .toThrow('O peso é obrigatório!')
  })

  it('deve lançar erro se a cor não for informada', () => {
    expect(() => new Pet(makeValidData({ color: undefined })))
      .toThrow('A cor é obrigatória!')
  })

  it('deve lançar erro se não houver ao menos uma imagem', () => {
    expect(() => new Pet(makeValidData({ images: [] })))
      .toThrow('A imagem é obrigatória!')
  })

  it('deve aceitar description como campo opcional', () => {
    const pet = new Pet(makeValidData({ description: undefined }))
    expect(pet.description).toBeUndefined()
  })
})