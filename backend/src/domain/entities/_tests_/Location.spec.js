const { Location } = require('../Location')

describe('Entidade Location (regras geográficas)', () => {
  const makeValid = (overrides = {}) => ({
    name: 'Clínica Centro',
    latitude: -23.55052,
    longitude: -46.633308,
    ...overrides,
  })

  it('deve criar uma Location válida', () => {
    const loc = new Location(makeValid())
    expect(loc.name).toBe('Clínica Centro')
    expect(loc.latitude).toBe(-23.55052)
    expect(loc.longitude).toBe(-46.633308)
  })

  it('deve lançar erro se o nome não for informado', () => {
    expect(() => new Location(makeValid({ name: undefined })))
      .toThrow('O nome da localização é obrigatório!')
  })

  it('deve lançar erro se a latitude estiver fora do intervalo [-90, 90]', () => {
    expect(() => new Location(makeValid({ latitude: 120 })))
      .toThrow('Latitude inválida!')
  })

  it('deve lançar erro se a longitude estiver fora do intervalo [-180, 180]', () => {
    expect(() => new Location(makeValid({ longitude: 200 })))
      .toThrow('Longitude inválida!')
  })

  it('deve lançar erro se latitude/longitude não forem números', () => {
    expect(() => new Location(makeValid({ latitude: 'abc' })))
      .toThrow('As coordenadas devem ser números!')
  })
})