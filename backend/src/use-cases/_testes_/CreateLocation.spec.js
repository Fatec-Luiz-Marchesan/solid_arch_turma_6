
const { CreateLocation } = require('../CreateLocation')

describe('CreateLocation Use Case', () => {
  const makeLocationRepository = () => ({
    create: jest.fn().mockImplementation(async (data) => ({
      id: 'location-id',
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
    })),
  })

  const makeSut = () => {
    const locationRepository = makeLocationRepository()
    const sut = new CreateLocation(locationRepository)
    return { sut, locationRepository }
  }

  const validInput = {
    name: 'Clínica Centro',
    latitude: -23.55052,
    longitude: -46.633308,
  }

  it('deve lançar erro se o nome não for informado (validação da entidade)', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, name: undefined }))
      .rejects.toThrow('O nome da localização é obrigatório!')
  })

  it('deve lançar erro se a latitude for inválida', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, latitude: 120 }))
      .rejects.toThrow('Latitude inválida!')
  })

  it('deve persistir a localização através do repositório', async () => {
    const { sut, locationRepository } = makeSut()
    await sut.execute(validInput)

    expect(locationRepository.create).toHaveBeenCalledWith({
      name: 'Clínica Centro',
      latitude: -23.55052,
      longitude: -46.633308,
    })
  })

  it('deve retornar a localização criada com id', async () => {
    const { sut } = makeSut()
    const result = await sut.execute(validInput)

    expect(result).toHaveProperty('id', 'location-id')
    expect(result.name).toBe('Clínica Centro')
  })
})