const { describe, it, expect } = require('@jest/globals');
const {
  validateNotification,
  validateListFilters,
} = require('../../helpers/validate-notification');

describe('validateNotification', () => {
  const valid = {
    type: 'message_received',
    title: 'Nova mensagem',
    body: 'Você recebeu uma mensagem nova',
    recipientId: 'u1',
  };

  it('aceita notificação válida', () => {
    expect(validateNotification(valid).isValid).toBe(true);
  });

  it('rejeita sem type', () => {
    expect(validateNotification({ ...valid, type: undefined }).isValid).toBe(false);
  });

  it('rejeita type inválido', () => {
    expect(validateNotification({ ...valid, type: 'foo' }).isValid).toBe(false);
  });

  it('rejeita sem title', () => {
    expect(validateNotification({ ...valid, title: '' }).isValid).toBe(false);
  });

  it('rejeita title muito longo', () => {
    expect(validateNotification({ ...valid, title: 'a'.repeat(201) }).isValid).toBe(false);
  });

  it('rejeita sem body', () => {
    expect(validateNotification({ ...valid, body: '' }).isValid).toBe(false);
  });

  it('rejeita body muito longo', () => {
    expect(validateNotification({ ...valid, body: 'a'.repeat(1001) }).isValid).toBe(false);
  });

  it('rejeita sem recipientId', () => {
    expect(validateNotification({ ...valid, recipientId: undefined }).isValid).toBe(false);
  });

  it('aceita priority válida', () => {
    expect(validateNotification({ ...valid, priority: 'high' }).isValid).toBe(true);
  });

  it('rejeita priority inválida', () => {
    expect(validateNotification({ ...valid, priority: 'super' }).isValid).toBe(false);
  });

  it('aceita channels válidos', () => {
    expect(validateNotification({ ...valid, channels: ['in_app', 'email'] }).isValid).toBe(true);
  });

  it('rejeita channels não-array', () => {
    expect(validateNotification({ ...valid, channels: 'in_app' }).isValid).toBe(false);
  });

  it('rejeita channels vazio', () => {
    expect(validateNotification({ ...valid, channels: [] }).isValid).toBe(false);
  });

  it('rejeita channel inválido', () => {
    expect(validateNotification({ ...valid, channels: ['carrier_pigeon'] }).isValid).toBe(false);
  });

  it('aceita expiresAt futuro', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(validateNotification({ ...valid, expiresAt: future }).isValid).toBe(true);
  });

  it('rejeita expiresAt no passado', () => {
    expect(validateNotification({ ...valid, expiresAt: '2000-01-01' }).isValid).toBe(false);
  });

  it('rejeita expiresAt inválido', () => {
    expect(validateNotification({ ...valid, expiresAt: 'não-é-data' }).isValid).toBe(false);
  });
});

describe('validateListFilters', () => {
  it('aceita filtros vazios', () => {
    const r = validateListFilters({});
    expect(r.isValid).toBe(true);
    expect(r.filters.limit).toBe(50);
  });

  it('aceita filtros válidos', () => {
    const r = validateListFilters({
      type: 'system',
      status: 'unread',
      priority: 'high',
      limit: '20',
    });
    expect(r.isValid).toBe(true);
    expect(r.filters.limit).toBe(20);
  });

  it('rejeita type inválido', () => {
    expect(validateListFilters({ type: 'foo' }).isValid).toBe(false);
  });

  it('rejeita status inválido', () => {
    expect(validateListFilters({ status: 'foo' }).isValid).toBe(false);
  });

  it('rejeita limit fora do range', () => {
    expect(validateListFilters({ limit: '200' }).isValid).toBe(false);
    expect(validateListFilters({ limit: '0' }).isValid).toBe(false);
  });

  it('aceita intervalo de datas', () => {
    const r = validateListFilters({
      fromDate: '2024-01-01',
      toDate: '2024-12-31',
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita fromDate inválido', () => {
    expect(validateListFilters({ fromDate: 'lixo' }).isValid).toBe(false);
  });
});

describe('validateNotification - actionUrl', () => {
  const valid = {
    type: 'message_received',
    title: 'Nova mensagem',
    body: 'Você recebeu uma mensagem nova',
    recipientId: 'u1',
  };

  it('aceita ausência de actionUrl', () => {
    expect(validateNotification(valid).isValid).toBe(true);
  });

  it('aceita URL http(s) válida', () => {
    const r = validateNotification({ ...valid, actionUrl: 'https://app.com/pets/1' });
    expect(r.isValid).toBe(true);
  });

  it('aceita caminho relativo', () => {
    expect(validateNotification({ ...valid, actionUrl: '/messages/abc' }).isValid).toBe(true);
  });

  it('rejeita esquema não permitido (ex.: javascript:)', () => {
    const r = validateNotification({ ...valid, actionUrl: 'javascript:alert(1)' });
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => /actionUrl/.test(e))).toBe(true);
  });

  it('rejeita actionUrl não-texto', () => {
    expect(validateNotification({ ...valid, actionUrl: 123 }).isValid).toBe(false);
  });

  it('rejeita actionUrl muito longo', () => {
    const longUrl = '/' + 'a'.repeat(500);
    expect(validateNotification({ ...valid, actionUrl: longUrl }).isValid).toBe(false);
  });
});