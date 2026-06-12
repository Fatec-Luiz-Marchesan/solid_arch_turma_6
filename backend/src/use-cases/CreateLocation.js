const { Location } = require('../domain/entities/Location')

class CreateLocation {
  constructor(locationRepository) {
    this.locationRepository = locationRepository
  }

  async execute({ name, latitude, longitude }) {
    const location = new Location({ name, latitude, longitude })
    const created = await this.locationRepository.create({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    })
    return created
  }
}

module.exports = { CreateLocation }