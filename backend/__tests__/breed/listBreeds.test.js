const { describe, it, expect } = require('@jest/globals');
const { listBreeds } = require('../../usecases/breed/listBreeds');

const makeRepo = (items = []) => ({
  findActive: jest.fn(async (query = {}) =>
    items.filter((b) => !query.species || b.species === query.species)
  ),
});

describe('listBreeds use case', () => {
  it('lista raças ativas (200)', async () => {
    const repo = makeRepo([
      { _id: '1', name: 'A', species: 'dog' },
      { _id: '2', name: 'B', species: 'cat' },
    ]);
    const r = await listBreeds({ BreedRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.breeds).toHaveLength(2);
  });

  it('retorna lista vazia quando não há raças', async () => {
    const r = await listBreeds({ BreedRepository: makeRepo() });
    expect(r.breeds).toEqual([]);
  });

  it('filtra por espécie quando informada', async () => {
    const repo = makeRepo([
      { _id: '1', name: 'A', species: 'dog' },
      { _id: '2', name: 'B', species: 'cat' },
      { _id: '3', name: 'C', species: 'dog' },
    ]);
    const r = await listBreeds({
      BreedRepository: repo,
      filters: { species: 'dog' },
    });
    expect(r.breeds).toHaveLength(2);
    expect(repo.findActive).toHaveBeenCalledWith({ species: 'dog' });
  });

  it('rejeita filtro de espécie inválido (422)', async () => {
    const r = await listBreeds({
      BreedRepository: makeRepo(),
      filters: { species: 'dragon' },
    });
    expect(r.status).toBe(422);
  });

  it('ignora filtro quando species é undefined', async () => {
    const repo = makeRepo([{ _id: '1', name: 'A', species: 'dog' }]);
    await listBreeds({ BreedRepository: repo, filters: {} });
    expect(repo.findActive).toHaveBeenCalledWith({});
  });
});