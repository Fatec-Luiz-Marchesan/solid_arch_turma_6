
const { HaversineDistanceCalculator } = require('../HaversineDistanceCalculator')

describe('HaversineDistanceCalculator', () => {
  const makeSut = () => new HaversineDistanceCalculator()

  it('deve retornar 0 quando origem e destino são o mesmo ponto', () => {
    const sut = makeSut()
    const ponto = { latitude: -23.55052, longitude: -46.633308 }

    const distancia = sut.calculate(ponto, ponto)

    expect(distancia).toBe(0)
  })

  it('deve calcular ~360km entre São Paulo e Rio de Janeiro', () => {
    const sut = makeSut()
    const saoPaulo = { latitude: -23.55052, longitude: -46.633308 }
    const rioDeJaneiro = { latitude: -22.906847, longitude: -43.172896 }

    const distancia = sut.calculate(saoPaulo, rioDeJaneiro)

    // distância real ~360km; aceitamos uma margem por causa do arredondamento
    expect(distancia).toBeGreaterThan(350)
    expect(distancia).toBeLessThan(370)
  })

  it('deve ser simétrico: distância A→B igual a B→A', () => {
    const sut = makeSut()
    const a = { latitude: -23.55052, longitude: -46.633308 }
    const b = { latitude: -22.906847, longitude: -43.172896 }

    const ida = sut.calculate(a, b)
    const volta = sut.calculate(b, a)

    expect(ida).toBeCloseTo(volta, 5)
  })
})