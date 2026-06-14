async function deleteSettings({ user, SettingsRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const settings = await SettingsRepository.findByUser(user._id);
  if (!settings || settings.deletedAt) {
    return { success: false, status: 404, errors: ['Configurações não encontradas!'] };
  }

  await SettingsRepository.updateByUser(user._id, { deletedAt: new Date() });
  return { success: true, status: 200, message: 'Configurações removidas!' };
}

module.exports = { deleteSettings };