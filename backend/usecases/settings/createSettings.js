const { validateSettings } = require('../../helpers/validate-settings');

async function createSettings({ data, user, SettingsRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const validation = validateSettings(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const existing = await SettingsRepository.findByUser(user._id);
  if (existing) {
    return {
      success: false,
      status: 409,
      errors: ['Configurações já existem para este usuário!'],
    };
  }

  const d = data || {};
  const n = d.notifications || {};
  const qh = (n.quietHours && typeof n.quietHours === 'object') ? n.quietHours : {};
  const notifications = {
    email: typeof n.email === 'boolean' ? n.email : true,
    push: typeof n.push === 'boolean' ? n.push : true,
    sms: typeof n.sms === 'boolean' ? n.sms : false,
    quietHours: {
      enabled: typeof qh.enabled === 'boolean' ? qh.enabled : false,
      start: typeof qh.start === 'string' ? qh.start : '22:00',
      end: typeof qh.end === 'string' ? qh.end : '08:00',
    },
  };

  const acc = (d.accessibility && typeof d.accessibility === 'object') ? d.accessibility : {};
  const accessibility = {
    fontSize: acc.fontSize || 'medium',
    highContrast: typeof acc.highContrast === 'boolean' ? acc.highContrast : false,
  };

  const settings = await SettingsRepository.create({
    user: { _id: user._id, name: user.name },
    theme: d.theme || 'system',
    language: d.language || 'pt-BR',
    timezone: d.timezone ? d.timezone.trim() : 'America/Sao_Paulo',
    dateFormat: d.dateFormat || 'DD/MM/YYYY',
    timeFormat: d.timeFormat || '24h',
    notifications,
    accessibility,
    deletedAt: null,
  });

  return { success: true, status: 201, settings };
}

module.exports = { createSettings };