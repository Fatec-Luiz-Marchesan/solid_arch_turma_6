const { validateLocation } = require('../../helpers/validate-location');

async function createLocation({ data, user, LocationRepository }) {
  const validation = validateLocation(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (data.isPrimary) {
    await LocationRepository.unsetPrimaryForUser(user._id);
  }

  const location = await LocationRepository.create({
    name: data.name.trim(),
    street: data.street.trim(),
    number: data.number,
    city: data.city.trim(),
    state: data.state,
    zipCode: data.zipCode,
    country: data.country || 'Brasil',
    latitude: data.latitude,
    longitude: data.longitude,
    user: { _id: user._id, name: user.name },
    isPrimary: data.isPrimary || false,
  });

  return { success: true, status: 201, location };
}

module.exports = { createLocation };