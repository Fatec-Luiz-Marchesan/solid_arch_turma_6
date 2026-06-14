const { describe, it, expect } = require('@jest/globals');
const { getBreedById } = require('../../usecases/breed/getBreedById');

const makeRepo = (breed = null) => ({
  findById: jest.fn(async () => breed),
});

describe('getBreedById use case', () => {
  it('retorna a raça (200)', async () => {
    const repo = makeRepo({ _id: 'b1', name: 'Labrador', deletedAt: null });
    const r = await getBreedById({ id: 'b1', BreedRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.breed._id).toBe('b1');
  });

  it('falha sem id (422)', async () => {
    const r = await getBreedById({ id: '', BreedRepository: makeRepo() });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando não encontrada', async () => {
    const r = await getBreedById({ id: 'nope', BreedRepository: makeRepo(null) });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando a raça está soft-deleted', async () => {
    const repo = makeRepo({ _id: 'b1', name: 'A', deletedAt: new Date() });
    const r = await getBreedById({ id: 'b1', BreedRepository: repo });
    expect(r.status).toBe(404);
  });
});