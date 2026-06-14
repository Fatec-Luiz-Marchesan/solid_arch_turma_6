const { validateSettings } = require('../../helpers/validate-settings');

async function updateSettings({ data, user, SettingsRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const settings = await SettingsRepository.findByUser(user._id);
  if (!settings || settings.deletedAt) {
    return { success: false, status: 404, errors: ['Configurações não encontradas!'] };
  }

  const validation = validateSettings(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const d = data || {};
  const updatePayload = {};

  if (d.theme !== undefined) updatePayload.theme = d.theme;
  if (d.language !== undefined) updatePayload.language = d.language;
  if (d.timezone !== undefined) updatePayload.timezone = d.timezone.trim();

  if (d.notifications !== undefined) {
    const current = settings.notifications || {};
    const incoming = d.notifications || {};
    updatePayload.notifications = {
      email: typeof incoming.email === 'boolean' ? incoming.email : current.email,
      push: typeof incoming.push === 'boolean' ? incoming.push : current.push,
      sms: typeof incoming.sms === 'boolean' ? incoming.sms : current.sms,
    };
  }

  const updated = await SettingsRepository.updateByUser(user._id, updatePayload);
  return { success: true, status: 200, settings: updated };
}

module.exports = { updateSettings };