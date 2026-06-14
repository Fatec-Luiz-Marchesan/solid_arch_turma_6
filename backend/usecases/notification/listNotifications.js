const { validateListFilters } = require('../../helpers/validate-notification');

async function listNotifications({ user, filters, NotificationRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const validation = validateListFilters(filters || {});
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const notifications = await NotificationRepository.findByRecipient(
    user._id,
    validation.filters
  );
  return { success: true, status: 200, notifications };
}

module.exports = { listNotifications };