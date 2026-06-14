const { describe, it, expect } = require('@jest/globals');
const { createBreed } = require('../../usecases/breed/createBreed');

const makeRepo = (existingByName = null) => ({
  findByName: jest.fn(async () => existingByName),
  create: jest.fn(async (d) => ({ _id: 'breed1', ...d })),
});

describe('createBreed use case', () => {
  it('cria raça com defaults (201)', async () => {
    const repo = makeRepo();
    const r = await createBreed({
      data: { name: 'Labrador', species: 'dog' },
      user: { _id: 'u1', name: 'Ana' },
      BreedRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    const payload = repo.create.mock.calls[0][0];
    expect(payload.size).toBe('medium');
    expect(payload.hypoallergenic).toBe(false);
    expect(payload.user).toEqual({ _id: 'u1', name: 'Ana' });
    expect(payload.deletedAt).toBeNull();
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await createBreed({
      data: { name: 'Labrador', species: 'dog' },
      user: null,
      BreedRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
    expect(r.success).toBe(false);
  });

  it('falha com dados inválidos (422)', async () => {
    const r = await createBreed({
      data: { name: 'L', species: 'dog' },
      user: { _id: 'u1' },
      BreedRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('falha quando já existe raça com o mesmo nome (409)', async () => {
    const repo = makeRepo({ _id: 'old', name: 'Poodle' });
    const r = await createBreed({
      data: { name: 'poodle', species: 'dog' },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.status).toBe(409);
  });

  it('normaliza nome, apara temperament e origin', async () => {
    const repo = makeRepo();
    await createBreed({
      data: {
        name: '  Border   Collie ',
        species: 'dog',
        temperament: [' inteligente ', 'ativo'],
        origin: '  Escócia  ',
      },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    const p = repo.create.mock.calls[0][0];
    expect(p.name).toBe('Border Collie');
    expect(p.temperament).toEqual(['inteligente', 'ativo']);
    expect(p.origin).toBe('Escócia');
  });

  it('aceita valores customizados válidos', async () => {
    const repo = makeRepo();
    const r = await createBreed({
      data: {
        name: 'Poodle',
        species: 'dog',
        size: 'small',
        lifeExpectancy: 14,
        hypoallergenic: true,
      },
      user: { _id: 'u1' },
      BreedRepository: repo,
    });
    expect(r.success).toBe(true);
    const p = repo.create.mock.calls[0][0];
    expect(p.size).toBe('small');
    expect(p.lifeExpectancy).toBe(14);
    expect(p.hypoallergenic).toBe(true);
  });
});