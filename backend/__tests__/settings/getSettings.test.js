const { describe, it, expect } = require('@jest/globals');
const { getSettings } = require('../../usecases/settings/getSettings');

describe('getSettings use case', () => {
  it('retorna as configurações do usuário (200)', async () => {
    const repo = { findByUser: jest.fn(async () => ({ _id: 's1', theme: 'dark' })) };
    const r = await getSettings({ user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.settings.theme).toBe('dark');
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await getSettings({ user: null, SettingsRepository: {} });
    expect(r.status).toBe(401);
  });

  it('retorna 404 quando não existem', async () => {
    const repo = { findByUser: jest.fn(async () => null) };
    const r = await getSettings({ user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando soft-deleted', async () => {
    const repo = { findByUser: jest.fn(async () => ({ _id: 's1', deletedAt: new Date() })) };
    const r = await getSettings({ user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.status).toBe(404);
  });
});