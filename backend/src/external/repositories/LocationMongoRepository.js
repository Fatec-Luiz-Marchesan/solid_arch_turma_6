const { ILocationRepository } = require('../../domain/repositories/ILocationRepository')
const LocationModel = require('../models/LocationModel')

class LocationMongoRepository extends ILocationRepository {
  async create(locationData) {
    const doc = await LocationModel.create({
      name: locationData.name,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      geo: {
        type: 'Point',
        coordinates: [locationData.longitude, locationData.latitude],
      },
    })
    return {
      id: doc._id.toString(),
      name: doc.name,
      latitude: doc.latitude,
      longitude: doc.longitude,
    }
  }

  async findAll() {
    const docs = await LocationModel.find().sort('-createdAt')
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      latitude: doc.latitude,
      longitude: doc.longitude,
    }))
  }
}

module.exports = { LocationMongoRepository }