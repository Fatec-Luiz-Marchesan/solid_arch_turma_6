class FindNearbyLocations {
  // Injeção de dependência via construtor (Dependency Inversion)
  constructor(locationRepository, distanceCalculator) {
    this.locationRepository = locationRepository
    this.distanceCalculator = distanceCalculator
  }

  async execute({ latitude, longitude, radiusKm }) {
    if (typeof radiusKm !== 'number' || radiusKm <= 0) {
      throw new Error('O raio de busca deve ser um número positivo!')
    }

    const origin = { latitude, longitude }
    const all = await this.locationRepository.findAll()

    return all
      .map((loc) => ({
        ...loc,
        distanceKm: this.distanceCalculator.calculate(origin, loc),
      }))
      .filter((loc) => loc.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }
}

module.exports = { FindNearbyLocations }