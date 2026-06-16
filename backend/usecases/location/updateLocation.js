const { validateLocation } = require('../../helpers/validate-location');

async function updateLocation({ id, data, user, LocationRepository }) {
  const location = await LocationRepository.findById(id);
  if (!location) {
    return { success: false, status: 404, errors: ['Localização não encontrada!'] };
  }

  if (String(location.user._id) !== String(user._id)) {
    return {
      success: false,
      status: 403,
      errors: ['Apenas o dono pode editar a localização!'],
    };
  }

  const validation = validateLocation(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const updated = await LocationRepository.update(id, {
    name: data.name.trim(),
    street: data.street.trim(),
    number: data.number,
    city: data.city.trim(),
    state: data.state,
    zipCode: data.zipCode,
    country: data.country || 'Brasil',
    latitude: data.latitude,
    longitude: data.longitude,
  });

  return { success: true, status: 200, location: updated };
}

module.exports = { updateLocation };