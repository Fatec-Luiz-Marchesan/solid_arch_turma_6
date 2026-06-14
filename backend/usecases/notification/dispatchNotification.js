async function dispatchNotification({ notification, channelAdapters }) {
  if (!notification || !notification.channels || notification.channels.length === 0) {
    return { success: false, status: 422, errors: ['Notificação sem canais!'] };
  }

  const results = [];

  for (const channel of notification.channels) {
    const adapter = channelAdapters[channel];
    if (!adapter) {
      results.push({ channel, success: false, reason: 'Adapter não configurado' });
      continue;
    }

    try {
      await adapter.send(notification);
      results.push({ channel, success: true });
    } catch (err) {
      results.push({ channel, success: false, reason: err.message });
    }
  }

  const anySuccess = results.some((r) => r.success);
  return {
    success: anySuccess,
    status: anySuccess ? 200 : 502,
    results,
  };
}

module.exports = { dispatchNotification };