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

  if (d.dateFormat !== undefined) updatePayload.dateFormat = d.dateFormat;
  if (d.timeFormat !== undefined) updatePayload.timeFormat = d.timeFormat;

  if (d.notifications !== undefined) {
    const current = settings.notifications || {};
    const incoming = d.notifications || {};
    const currentQH = current.quietHours || { enabled: false, start: '22:00', end: '08:00' };
    const incomingQH = (incoming.quietHours && typeof incoming.quietHours === 'object')
      ? incoming.quietHours : {};
    updatePayload.notifications = {
      email: typeof incoming.email === 'boolean' ? incoming.email : current.email,
      push: typeof incoming.push === 'boolean' ? incoming.push : current.push,
      sms: typeof incoming.sms === 'boolean' ? incoming.sms : current.sms,
      quietHours: {
        enabled: typeof incomingQH.enabled === 'boolean' ? incomingQH.enabled : currentQH.enabled,
        start: incomingQH.start !== undefined ? incomingQH.start : currentQH.start,
        end: incomingQH.end !== undefined ? incomingQH.end : currentQH.end,
      },
    };
  }

  if (d.accessibility !== undefined) {
    const current = settings.accessibility || { fontSize: 'medium', highContrast: false };
    const incoming = d.accessibility || {};
    updatePayload.accessibility = {
      fontSize: incoming.fontSize || current.fontSize,
      highContrast:
        typeof incoming.highContrast === 'boolean' ? incoming.highContrast : current.highContrast,
    };
  }

  const updated = await SettingsRepository.updateByUser(user._id, updatePayload);
  return { success: true, status: 200, settings: updated };
}

module.exports = { updateSettings };