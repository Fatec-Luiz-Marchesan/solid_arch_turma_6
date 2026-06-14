const { describe, it, expect } = require('@jest/globals');
const { deleteBreed } = require('../../usecases/breed/deleteBreed');

const makeRepo = (current = null) => ({
  findById: jest.fn(async () => current),
  update: jest.fn(async (id, data) => ({ ...current, ...data, _id: id })),
});

describe('deleteBreed use case', () => {
  it('faz soft delete (200)', async () => {
    const repo = makeRepo({ _id: 'b1', name: 'A', deletedAt: null });
    const r = await deleteBreed({
      id: 'b1',
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    const payload = repo.update.mock.calls[0][1];
    expect(payload.deletedAt).toBeInstanceOf(Date);
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await deleteBreed({
      id: 'b1',
      user: null,
      BreedRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('falha sem id (422)', async () => {
    const r = await deleteBreed({
      id: '',
      user: { _id: 'u1' },
      BreedRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando a raça não existe', async () => {
    const r = await deleteBreed({
      id: 'nope',
      user: { _id: 'u1' },
      BreedRepository: makeRepo(null),
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando já está soft-deleted', async () => {
    const repo = makeRepo({ _id: 'b1', name: 'A', deletedAt: new Date() });
    const r = await deleteBreed({
      id: 'b1',
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});