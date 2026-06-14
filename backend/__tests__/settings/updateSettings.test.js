const { describe, it, expect } = require('@jest/globals');
const { updateSettings } = require('../../usecases/settings/updateSettings');

const baseSettings = {
  _id: 's1',
  user: { _id: 'u1' },
  theme: 'system',
  notifications: { email: true, push: true, sms: false },
};

const makeRepo = (found = baseSettings) => ({
  findByUser: jest.fn(async () => found),
  updateByUser: jest.fn(async (userId, data) => ({ ...baseSettings, ...data })),
});

describe('updateSettings use case', () => {
  it('atualiza tema (200)', async () => {
    const repo = makeRepo();
    const r = await updateSettings({ data: { theme: 'dark' }, user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.status).toBe(200);
    expect(repo.updateByUser.mock.calls[0][1]).toEqual({ theme: 'dark' });
  });

  it('falha sem usuário (401)', async () => {
    const r = await updateSettings({ data: {}, user: null, SettingsRepository: makeRepo() });
    expect(r.status).toBe(401);
  });

  it('retorna 404 quando não existem', async () => {
    const repo = makeRepo(null);
    const r = await updateSettings({ data: { theme: 'dark' }, user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.status).toBe(404);
  });

  it('falha com idioma inválido (422)', async () => {
    const repo = makeRepo();
    const r = await updateSettings({ data: { language: 'xx' }, user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.status).toBe(422);
  });

  it('faz merge parcial de notifications com as atuais', async () => {
    const repo = makeRepo();
    await updateSettings({ data: { notifications: { sms: true } }, user: { _id: 'u1' }, SettingsRepository: repo });
    expect(repo.updateByUser.mock.calls[0][1].notifications).toEqual({
      email: true,
      push: true,
      sms: true,
    });
  });
});