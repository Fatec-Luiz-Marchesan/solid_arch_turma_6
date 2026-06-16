async function setPrimaryLocation({ id, user, LocationRepository }) {
  const location = await LocationRepository.findById(id);
  if (!location) {
    return { success: false, status: 404, errors: ['Localização não encontrada!'] };
  }

  if (String(location.user._id) !== String(user._id)) {
    return {
      success: false,
      status: 403,
      errors: ['Apenas o dono pode definir como principal!'],
    };
  }

  await LocationRepository.unsetPrimaryForUser(user._id);
  const updated = await LocationRepository.update(id, { isPrimary: true });

  return { success: true, status: 200, location: updated };
}

module.exports = { setPrimaryLocation };