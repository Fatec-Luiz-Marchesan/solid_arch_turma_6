class HaversineDistanceCalculator {
  calculate(origin, target) {
    const toRad = (value) => (value * Math.PI) / 180
    const R = 6371 // raio da Terra em km

    const dLat = toRad(target.latitude - origin.latitude)
    const dLon = toRad(target.longitude - origin.longitude)

    const lat1 = toRad(origin.latitude)
    const lat2 = toRad(target.latitude)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}

module.exports = { HaversineDistanceCalculator }