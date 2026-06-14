const { describe, it, expect } = require('@jest/globals');
const { deleteSettings } = require('../../usecases/settings/deleteSettings');

const makeRepo = (found = { _id: 's1', user: { _id: 'u1' } }) => ({
  findByUser: jest.fn(async () => found),
  updateByUser: jest.fn(async () => ({ _id: 's1', deletedAt: new Date() })),
});

describe('deleteSettings use case', () => {
  it('faz soft delete (200) e grava deletedAt', async () => {
    const repo = makeRepo();
    const r = await deleteSettings({ user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(repo.updateByUser.mock.calls[0][1].deletedAt).toBeInstanceOf(Date);
  });

  it('falha sem usuário (401)', async () => {
    const r = await deleteSettings({ user: null, SettingsRepository: makeRepo() });
    expect(r.status).toBe(401);
  });

  it('retorna 404 quando não existem', async () => {
    const repo = makeRepo(null);
    const r = await deleteSettings({ user: { _id: 'u1' }, SettingsRepository: repo });
    expect(r.status).toBe(404);
  });
});