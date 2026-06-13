const { Location } = require('../Location')

describe('Entidade Location (regras de domínio)', () => {
  const makeValidData = (overrides = {}) => ({
    name: 'Praça Central',
    latitude: -23.55,
    longitude: -46.63,
    ...overrides,
  })


  it('deve criar uma Location válida com os dados corretos', () => {
    const location = new Location(makeValidData())
    expect(location.name).toBe('Praça Central')
    expect(location.latitude).toBe(-23.55)
    expect(location.longitude).toBe(-46.63)
  })

  it('deve aceitar os limites válidos das coordenadas', () => {
    expect(() => new Location(makeValidData({ latitude: -90, longitude: -180 })))
      .not.toThrow()
    expect(() => new Location(makeValidData({ latitude: 90, longitude: 180 })))
      .not.toThrow()
  })

  it('deve aceitar coordenadas no valor zero', () => {
    const location = new Location(makeValidData({ latitude: 0, longitude: 0 }))
    expect(location.latitude).toBe(0)
    expect(location.longitude).toBe(0)
  })


  it('deve lançar erro se o nome não for informado', () => {
    expect(() => new Location(makeValidData({ name: undefined })))
      .toThrow('O nome da localização é obrigatório!')
  })

  it('deve lançar erro se a latitude não for um número', () => {
    expect(() => new Location(makeValidData({ latitude: '-23.55' })))
      .toThrow('As coordenadas devem ser números!')
  })

  it('deve lançar erro se a longitude não for um número', () => {
    expect(() => new Location(makeValidData({ longitude: undefined })))
      .toThrow('As coordenadas devem ser números!')
  })

  it('deve lançar erro se a latitude for menor que -90', () => {
    expect(() => new Location(makeValidData({ latitude: -91 })))
      .toThrow('Latitude inválida!')
  })

  it('deve lançar erro se a latitude for maior que 90', () => {
    expect(() => new Location(makeValidData({ latitude: 91 })))
      .toThrow('Latitude inválida!')
  })

  it('deve lançar erro se a longitude for menor que -180', () => {
    expect(() => new Location(makeValidData({ longitude: -181 })))
      .toThrow('Longitude inválida!')
  })

  it('deve lançar erro se a longitude for maior que 180', () => {
    expect(() => new Location(makeValidData({ longitude: 181 })))
      .toThrow('Longitude inválida!')
  })
})