class Location {
  constructor({ name, latitude, longitude }) {
    if (!name) {
      throw new Error('O nome da localização é obrigatório!')
    }
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('As coordenadas devem ser números!')
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude inválida!')
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude inválida!')
    }

    this.name = name
    this.latitude = latitude
    this.longitude = longitude
  }
}

module.exports = { Location }