const { describe, it, expect } = require('@jest/globals');
const { updateBreed } = require('../../usecases/breed/updateBreed');

const makeRepo = ({ current = null, byName = null } = {}) => ({
  findById: jest.fn(async () => current),
  findByName: jest.fn(async () => byName),
  update: jest.fn(async (id, data) => ({ ...current, ...data, _id: id })),
});

describe('updateBreed use case', () => {
  it('atualiza campos válidos (200)', async () => {
    const repo = makeRepo({
      current: { _id: 'b1', name: 'Labrador', species: 'dog', size: 'medium' },
    });
    const r = await updateBreed({
      id: 'b1',
      data: { size: 'large', description: ' cão grande ' },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    const payload = repo.update.mock.calls[0][1];
    expect(payload.size).toBe('large');
    expect(payload.description).toBe('cão grande');
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await updateBreed({
      id: 'b1',
      data: {},
      user: null,
      BreedRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('falha sem id (422)', async () => {
    const r = await updateBreed({
      id: '',
      data: {},
      user: { _id: 'u1' },
      BreedRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando a raça não existe', async () => {
    const r = await updateBreed({
      id: 'nope',
      data: { size: 'large' },
      user: { _id: 'u1' },
      BreedRepository: makeRepo({ current: null }),
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando a raça está soft-deleted', async () => {
    const repo = makeRepo({
      current: { _id: 'b1', name: 'A', deletedAt: new Date() },
    });
    const r = await updateBreed({
      id: 'b1',
      data: { size: 'large' },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('rejeita dados inválidos (422)', async () => {
    const repo = makeRepo({
      current: { _id: 'b1', name: 'Labrador', species: 'dog' },
    });
    const r = await updateBreed({
      id: 'b1',
      data: { species: 'dragon' },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.status).toBe(422);
  });

  it('rejeita renomear para um nome já existente (409)', async () => {
    const repo = makeRepo({
      current: { _id: 'b1', name: 'Labrador', species: 'dog' },
      byName: { _id: 'b2', name: 'Poodle' },
    });
    const r = await updateBreed({
      id: 'b1',
      data: { name: 'Poodle' },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.status).toBe(409);
  });

  it('permite manter o mesmo nome (sem checar duplicidade)', async () => {
    const repo = makeRepo({
      current: { _id: 'b1', name: 'Labrador', species: 'dog' },
    });
    const r = await updateBreed({
      id: 'b1',
      data: { name: 'Labrador' },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.status).toBe(200);
    expect(repo.findByName).not.toHaveBeenCalled();
  });
});