const { FindNearbyLocations } = require('../FindNearbyLocations')

describe('FindNearbyLocations Use Case', () => {
  const makeLocationRepository = () => ({
    findAll: jest.fn().mockResolvedValue([
      { id: '1', name: 'Perto', latitude: -23.5505, longitude: -46.6333 },
      { id: '2', name: 'Longe', latitude: -22.9068, longitude: -43.1729 },
    ]),
  })

  // Estratégia de distância injetável (Open/Closed)
  const makeDistanceCalculator = () => ({
    // retorna km: 'Perto' = 1km, 'Longe' = 400km
    calculate: jest.fn((origin, target) =>
      target.name === 'Perto' ? 1 : 400
    ),
  })

  const makeSut = () => {
    const locationRepository = makeLocationRepository()
    const distanceCalculator = makeDistanceCalculator()
    const sut = new FindNearbyLocations(locationRepository, distanceCalculator)
    return { sut, locationRepository, distanceCalculator }
  }

  it('deve retornar apenas localizações dentro do raio informado', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      latitude: -23.5505,
      longitude: -46.6333,
      radiusKm: 50,
    })

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Perto')
  })

  it('deve ordenar as localizações da mais próxima para a mais distante', async () => {
    const { sut, distanceCalculator } = makeSut()
    distanceCalculator.calculate.mockImplementation((origin, target) =>
      target.name === 'Perto' ? 5 : 10
    )

    const result = await sut.execute({
      latitude: -23.5505,
      longitude: -46.6333,
      radiusKm: 100,
    })

    expect(result.map((l) => l.name)).toEqual(['Perto', 'Longe'])
    expect(result[0].distanceKm).toBe(5)
  })

  it('deve lançar erro se o raio não for um número positivo', async () => {
    const { sut } = makeSut()
    await expect(
      sut.execute({ latitude: -23.5, longitude: -46.6, radiusKm: -1 })
    ).rejects.toThrow('O raio de busca deve ser um número positivo!')
  })
})