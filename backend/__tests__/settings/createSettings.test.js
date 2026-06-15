const { describe, it, expect } = require('@jest/globals');
const { createSettings } = require('../../usecases/settings/createSettings');

const makeRepo = (existing = null) => ({
  findByUser: jest.fn(async () => existing),
  create: jest.fn(async (d) => ({ _id: 'set1', ...d })),
});

describe('createSettings use case', () => {
  it('cria configurações com defaults quando body vazio', async () => {
    const repo = makeRepo();
    const r = await createSettings({
      data: {},
      user: { _id: 'u1', name: 'João' },
      SettingsRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    const payload = repo.create.mock.calls[0][0];
    expect(payload.theme).toBe('system');
    expect(payload.language).toBe('pt-BR');
    expect(payload.timezone).toBe('America/Sao_Paulo');
    expect(payload.dateFormat).toBe('DD/MM/YYYY');
    expect(payload.timeFormat).toBe('24h');
    expect(payload.notifications.email).toBe(true);
    expect(payload.notifications.push).toBe(true);
    expect(payload.notifications.sms).toBe(false);
    expect(payload.notifications.quietHours).toEqual({ enabled: false, start: '22:00', end: '08:00' });
    expect(payload.accessibility).toEqual({ fontSize: 'medium', highContrast: false });
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await createSettings({ data: {}, user: null, SettingsRepository: makeRepo() });
    expect(r.status).toBe(401);
    expect(r.success).toBe(false);
  });

  it('falha com tema inválido (422)', async () => {
    const r = await createSettings({
      data: { theme: 'neon' },
      user: { _id: 'u1' },
      SettingsRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('falha quando configurações já existem (409)', async () => {
    const repo = makeRepo({ _id: 'old', user: { _id: 'u1' } });
    const r = await createSettings({ data: {}, user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.status).toBe(409);
  });

  it('faz merge das notifications enviadas com os defaults', async () => {
    const repo = makeRepo();
    await createSettings({
      data: { notifications: { sms: true } },
      user: { _id: 'u1' },
      SettingsRepository: repo,
    });
    const n = repo.create.mock.calls[0][0].notifications;
    expect(n.email).toBe(true);
    expect(n.push).toBe(true);
    expect(n.sms).toBe(true);
    expect(n.quietHours).toEqual({ enabled: false, start: '22:00', end: '08:00' });
  });

  it('aceita dateFormat e timeFormat customizados', async () => {
    const repo = makeRepo();
    await createSettings({
      data: { dateFormat: 'MM/DD/YYYY', timeFormat: '12h' },
      user: { _id: 'u1' },
      SettingsRepository: repo,
    });
    const p = repo.create.mock.calls[0][0];
    expect(p.dateFormat).toBe('MM/DD/YYYY');
    expect(p.timeFormat).toBe('12h');
  });

  it('rejeita dateFormat inválido (422)', async () => {
    const r = await createSettings({
      data: { dateFormat: 'invalid' },
      user: { _id: 'u1' },
      SettingsRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('rejeita timeFormat inválido (422)', async () => {
    const r = await createSettings({
      data: { timeFormat: '48h' },
      user: { _id: 'u1' },
      SettingsRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('aceita accessibility customizado', async () => {
    const repo = makeRepo();
    await createSettings({
      data: { accessibility: { fontSize: 'large', highContrast: true } },
      user: { _id: 'u1' },
      SettingsRepository: repo,
    });
    expect(repo.create.mock.calls[0][0].accessibility).toEqual({
      fontSize: 'large',
      highContrast: true,
    });
  });

  it('rejeita accessibility.fontSize inválido (422)', async () => {
    const r = await createSettings({
      data: { accessibility: { fontSize: 'huge' } },
      user: { _id: 'u1' },
      SettingsRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('aceita quietHours configurado', async () => {
    const repo = makeRepo();
    await createSettings({
      data: { notifications: { quietHours: { enabled: true, start: '23:00', end: '07:00' } } },
      user: { _id: 'u1' },
      SettingsRepository: repo,
    });
    expect(repo.create.mock.calls[0][0].notifications.quietHours).toEqual({
      enabled: true,
      start: '23:00',
      end: '07:00',
    });
  });

  it('aceita valores customizados válidos', async () => {
    const repo = makeRepo();
    const r = await createSettings({
      data: { theme: 'dark', language: 'en-US', timezone: '  UTC  ' },
      user: { _id: 'u1' },
      SettingsRepository: repo,
    });
    expect(r.success).toBe(true);
    const p = repo.create.mock.calls[0][0];
    expect(p.theme).toBe('dark');
    expect(p.language).toBe('en-US');
    expect(p.timezone).toBe('UTC');
  });
});