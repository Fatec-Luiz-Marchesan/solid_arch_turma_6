async function getLocationById({ id, user, LocationRepository }) {
  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const location = await LocationRepository.findById(id);
  if (!location) {
    return { success: false, status: 404, errors: ['Localização não encontrada!'] };
  }

  if (String(location.user._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  return { success: true, status: 200, location };
}

module.exports = { getLocationById };