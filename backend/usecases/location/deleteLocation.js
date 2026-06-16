async function deleteLocation({ id, user, LocationRepository }) {
  const location = await LocationRepository.findById(id);
  if (!location) {
    return { success: false, status: 404, errors: ['Localização não encontrada!'] };
  }

  if (String(location.user._id) !== String(user._id)) {
    return {
      success: false,
      status: 403,
      errors: ['Apenas o dono pode remover a localização!'],
    };
  }

  await LocationRepository.delete(id);
  return { success: true, status: 200, message: 'Localização removida!' };
}

module.exports = { deleteLocation };