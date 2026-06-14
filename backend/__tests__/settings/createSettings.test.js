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
    expect(payload.notifications).toEqual({ email: true, push: true, sms: false });
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
    expect(repo.create.mock.calls[0][0].notifications).toEqual({
      email: true,
      push: true,
      sms: true,
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