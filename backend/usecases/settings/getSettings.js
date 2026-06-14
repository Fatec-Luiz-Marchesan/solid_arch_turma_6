async function getSettings({ user, SettingsRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const settings = await SettingsRepository.findByUser(user._id);
  if (!settings || settings.deletedAt) {
    return { success: false, status: 404, errors: ['Configurações não encontradas!'] };
  }

  return { success: true, status: 200, settings };
}

module.exports = { getSettings };