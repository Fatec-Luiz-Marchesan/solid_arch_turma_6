const { CreateLocation } = require('../../use-cases/CreateLocation')
const { FindNearbyLocations } = require('../../use-cases/FindNearbyLocations')
const { LocationMongoRepository } = require('../../external/repositories/LocationMongoRepository')
const { HaversineDistanceCalculator } = require('../../domain/services/HaversineDistanceCalculator')

module.exports = class LocationController {
  // POST /locations/create
  static async create(req, res) {
    const { name, latitude, longitude } = req.body
    const repository = new LocationMongoRepository()
    const createLocation = new CreateLocation(repository)

    try {
      const location = await createLocation.execute({ name, latitude, longitude })
      return res.status(201).json({
        message: 'Localização cadastrada com sucesso!',
        location,
      })
    } catch (error) {
      return res.status(422).json({ message: error.message })
    }
  }

  // GET /locations/nearby?lat=&lng=&radius=
  static async nearby(req, res) {
    const latitude = Number(req.query.lat)
    const longitude = Number(req.query.lng)
    const radiusKm = Number(req.query.radius)

    const repository = new LocationMongoRepository()
    const calculator = new HaversineDistanceCalculator()
    const findNearby = new FindNearbyLocations(repository, calculator)

    try {
      const locations = await findNearby.execute({ latitude, longitude, radiusKm })
      return res.status(200).json({ locations })
    } catch (error) {
      return res.status(422).json({ message: error.message })
    }
  }
}