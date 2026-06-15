const NOTIFICATION_TYPES = [
  'message_received',
  'payment_completed',
  'payment_refunded',
  'pet_adopted',
  'pet_interest',
  'account_update',
  'system',
];

const CHANNELS = ['in_app', 'email', 'push'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const STATUSES = ['unread', 'read', 'archived', 'dismissed'];

function validateNotification(data) {
  const errors = [];

  if (!data.type) {
    errors.push('Tipo da notificação é obrigatório!');
  } else if (!NOTIFICATION_TYPES.includes(data.type)) {
    errors.push('Tipo de notificação inválido!');
  }

  if (!data.title || typeof data.title !== 'string') {
    errors.push('Título é obrigatório!');
  } else if (data.title.trim().length < 3) {
    errors.push('Título deve ter pelo menos 3 caracteres!');
  } else if (data.title.length > 200) {
    errors.push('Título não pode passar de 200 caracteres!');
  }

  if (!data.body || typeof data.body !== 'string') {
    errors.push('Corpo é obrigatório!');
  } else if (data.body.trim().length < 10) {
    errors.push('Corpo deve ter pelo menos 10 caracteres!');
  } else if (data.body.length > 2000) {
    errors.push('Corpo não pode passar de 2000 caracteres!');
  }

  if (!data.recipientId) {
    errors.push('Destinatário é obrigatório!');
  }

  if (data.priority && !PRIORITIES.includes(data.priority)) {
    errors.push('Prioridade inválida!');
  }

  if (data.channels !== undefined) {
    if (!Array.isArray(data.channels)) {
      errors.push('channels deve ser um array!');
    } else if (data.channels.length === 0) {
      errors.push('Pelo menos um canal é obrigatório!');
    } else if (!data.channels.every((c) => CHANNELS.includes(c))) {
      errors.push('Canais inválidos!');
    }
  }
if (
    data.actionUrl !== undefined &&
    data.actionUrl !== null &&
    data.actionUrl !== ''
  ) {
    if (typeof data.actionUrl !== 'string') {
      errors.push('actionUrl deve ser um texto!');
    } else if (data.actionUrl.length > 500) {
      errors.push('actionUrl não pode passar de 500 caracteres!');
    } else if (!/^(https?:\/\/|\/)[^\s]*$/.test(data.actionUrl.trim())) {
      errors.push('actionUrl deve ser uma URL http(s) ou caminho relativo!');
    }
  }

  if (data.expiresAt) {
    const exp = new Date(data.expiresAt);
    if (isNaN(exp.getTime())) {
      errors.push('expiresAt deve ser uma data válida!');
    } else if (exp.getTime() <= Date.now()) {
      errors.push('expiresAt deve estar no futuro!');
    }
  }

  if (data.scheduledAt) {
    const sched = new Date(data.scheduledAt);
    if (isNaN(sched.getTime())) {
      errors.push('scheduledAt deve ser uma data válida!');
    } else if (sched.getTime() <= Date.now()) {
      errors.push('scheduledAt deve estar no futuro!');
    }
  }

  return { isValid: errors.length === 0, errors };
}

function validateListFilters(filters) {
  const errors = [];
  const sanitized = {};

  if (filters.type) {
    if (!NOTIFICATION_TYPES.includes(filters.type)) {
      errors.push('Filtro de tipo inválido!');
    } else {
      sanitized.type = filters.type;
    }
  }

  if (filters.status) {
    if (!STATUSES.includes(filters.status)) {
      errors.push('Filtro de status inválido!');
    } else {
      sanitized.status = filters.status;
    }
  }

  if (filters.priority) {
    if (!PRIORITIES.includes(filters.priority)) {
      errors.push('Filtro de prioridade inválido!');
    } else {
      sanitized.priority = filters.priority;
    }
  }

  if (filters.fromDate) {
    const d = new Date(filters.fromDate);
    if (isNaN(d.getTime())) {
      errors.push('fromDate deve ser uma data válida!');
    } else {
      sanitized.fromDate = d;
    }
  }

  if (filters.toDate) {
    const d = new Date(filters.toDate);
    if (isNaN(d.getTime())) {
      errors.push('toDate deve ser uma data válida!');
    } else {
      sanitized.toDate = d;
    }
  }

  if (filters.limit !== undefined) {
    const n = parseInt(filters.limit, 10);
    if (isNaN(n) || n < 1 || n > 100) {
      errors.push('limit deve estar entre 1 e 100!');
    } else {
      sanitized.limit = n;
    }
  } else {
    sanitized.limit = 50;
  }

  return { isValid: errors.length === 0, errors, filters: sanitized };
}

module.exports = {
  validateNotification,
  validateListFilters,
  NOTIFICATION_TYPES,
  CHANNELS,
  PRIORITIES,
  STATUSES,
};