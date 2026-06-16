async function listLocations({ user, LocationRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const locations = await LocationRepository.findByUser(user._id);
  return { success: true, status: 200, locations };
}

module.exports = { listLocations };