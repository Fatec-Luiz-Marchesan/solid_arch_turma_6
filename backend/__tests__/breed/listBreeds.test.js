const { describe, it, expect } = require('@jest/globals');
const { listBreeds } = require('../../usecases/breed/listBreeds');

const makeRepo = (items = []) => ({
  findActive: jest.fn(async (query = {}, options = {}) => {
    let results = items.filter((b) => !query.species || b.species === query.species);
    const { skip = 0, limit } = options;
    results = results.slice(skip, limit ? skip + limit : undefined);
    return results;
  }),
  countActive: jest.fn(async (query = {}) =>
    items.filter((b) => !query.species || b.species === query.species).length
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
    expect(r.total).toBe(0);
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
    expect(repo.findActive).toHaveBeenCalledWith(
      { species: 'dog' },
      expect.objectContaining({ skip: 0, limit: 10 })
    );
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
    expect(repo.findActive).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ skip: 0 })
    );
  });

  describe('paginação', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      _id: String(i + 1),
      name: `Raça ${i + 1}`,
      species: 'dog',
    }));

    it('retorna metadados de paginação', async () => {
      const r = await listBreeds({ BreedRepository: makeRepo(items) });
      expect(r.total).toBe(25);
      expect(r.page).toBe(1);
      expect(r.limit).toBe(10);
      expect(r.totalPages).toBe(3);
    });

    it('respeita page e limit customizados', async () => {
      const r = await listBreeds({
        BreedRepository: makeRepo(items),
        pagination: { page: '2', limit: '5' },
      });
      expect(r.page).toBe(2);
      expect(r.limit).toBe(5);
      expect(r.totalPages).toBe(5);
      expect(r.breeds).toHaveLength(5);
    });

    it('rejeita page menor que 1 (422)', async () => {
      const r = await listBreeds({
        BreedRepository: makeRepo(items),
        pagination: { page: '0' },
      });
      expect(r.success).toBe(false);
      expect(r.status).toBe(422);
    });

    it('rejeita limit acima de 100 (422)', async () => {
      const r = await listBreeds({
        BreedRepository: makeRepo(items),
        pagination: { limit: '101' },
      });
      expect(r.success).toBe(false);
      expect(r.status).toBe(422);
    });

    it('rejeita limit igual a 0 (422)', async () => {
      const r = await listBreeds({
        BreedRepository: makeRepo(items),
        pagination: { limit: '0' },
      });
      expect(r.success).toBe(false);
      expect(r.status).toBe(422);
    });
  });

  describe('ordenação', () => {
    it('passa sortBy e sortOrder para o repositório', async () => {
      const repo = makeRepo([{ _id: '1', name: 'A', species: 'dog' }]);
      await listBreeds({
        BreedRepository: repo,
        pagination: { sortBy: 'name', sortOrder: 'asc' },
      });
      expect(repo.findActive).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ sortBy: 'name', sortOrder: 'asc' })
      );
    });

    it('usa createdAt desc como padrão quando sortBy não informado', async () => {
      const repo = makeRepo([{ _id: '1', name: 'A', species: 'dog' }]);
      await listBreeds({ BreedRepository: repo });
      expect(repo.findActive).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ sortBy: 'createdAt', sortOrder: 'desc' })
      );
    });

    it('ignora sortBy inválido e usa padrão', async () => {
      const repo = makeRepo([{ _id: '1', name: 'A', species: 'dog' }]);
      await listBreeds({
        BreedRepository: repo,
        pagination: { sortBy: 'invalid_field' },
      });
      expect(repo.findActive).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ sortBy: 'createdAt' })
      );
    });
  });
});
