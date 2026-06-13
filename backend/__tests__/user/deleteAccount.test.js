const { describe, it, expect } = require('@jest/globals');
const { deleteAccount } = require('../../usecases/user/deleteAccount');

const makeRepo = () => ({
  findById: jest.fn(async () => ({ _id: 'u1', password: 'hashedOld' })),
  delete: jest.fn(async () => true),
});

const makeHasher = (matches = true) => ({
  compare: jest.fn(async () => matches),
});

describe('deleteAccount use case', () => {
  it('deleta conta com senha correta', async () => {
    const repo = makeRepo();
    const r = await deleteAccount({
      data: { password: 'mypass' },
      user: { _id: 'u1' },
      UserRepository: repo,
      PasswordHasher: makeHasher(true),
    });
    expect(r.success).toBe(true);
    expect(repo.delete).toHaveBeenCalledWith('u1');
  });

  it('rejeita sem senha', async () => {
    const r = await deleteAccount({
      data: {},
      user: { _id: 'u1' },
      UserRepository: makeRepo(),
      PasswordHasher: makeHasher(),
    });
    expect(r.status).toBe(422);
  });

  it('rejeita com senha incorreta', async () => {
    const r = await deleteAccount({
      data: { password: 'wrong' },
      user: { _id: 'u1' },
      UserRepository: makeRepo(),
      PasswordHasher: makeHasher(false),
    });
    expect(r.status).toBe(422);
    expect(r.errors[0]).toMatch(/incorreta/);
  });

  it('rejeita sem usuário autenticado', async () => {
    const r = await deleteAccount({
      data: { password: 'x' },
      user: null,
      UserRepository: makeRepo(),
      PasswordHasher: makeHasher(),
    });
    expect(r.status).toBe(401);
  });

  it('rejeita quando usuário não existe no banco', async () => {
    const repo = { findById: jest.fn(async () => null), delete: jest.fn() };
    const r = await deleteAccount({
      data: { password: 'x' },
      user: { _id: 'u1' },
      UserRepository: repo,
      PasswordHasher: makeHasher(),
    });
    expect(r.status).toBe(404);
  });
});