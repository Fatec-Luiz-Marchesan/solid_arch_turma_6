const { describe, it, expect } = require('@jest/globals');
const { changePassword } = require('../../usecases/user/changePassword');

const makeRepo = () => ({
  findById: jest.fn(async () => ({ _id: 'u1', password: 'hashedOld' })),
  updatePassword: jest.fn(async () => true),
});

const makeHasher = (matches = true) => ({
  compare: jest.fn(async () => matches),
  hash: jest.fn(async () => 'hashedNew'),
});

const baseData = {
  currentPassword: 'oldpass123',
  newPassword: 'newpass456',
  confirmNewPassword: 'newpass456',
};

describe('changePassword use case', () => {
  it('troca senha com dados válidos', async () => {
    const repo = makeRepo();
    const hasher = makeHasher(true);
    const r = await changePassword({
      data: baseData,
      user: { _id: 'u1' },
      UserRepository: repo,
      PasswordHasher: hasher,
    });
    expect(r.success).toBe(true);
    expect(hasher.hash).toHaveBeenCalledWith('newpass456');
    expect(repo.updatePassword).toHaveBeenCalledWith('u1', 'hashedNew');
  });

  it('falha quando senha atual está incorreta', async () => {
    const repo = makeRepo();
    const hasher = makeHasher(false);
    const r = await changePassword({
      data: baseData,
      user: { _id: 'u1' },
      UserRepository: repo,
      PasswordHasher: hasher,
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
    expect(r.errors[0]).toMatch(/incorreta/);
  });

  it('falha com dados inválidos', async () => {
    const r = await changePassword({
      data: { currentPassword: '', newPassword: 'abc', confirmNewPassword: 'abc' },
      user: { _id: 'u1' },
      UserRepository: makeRepo(),
      PasswordHasher: makeHasher(),
    });
    expect(r.status).toBe(422);
  });

  it('falha sem usuário autenticado', async () => {
    const r = await changePassword({
      data: baseData,
      user: null,
      UserRepository: makeRepo(),
      PasswordHasher: makeHasher(),
    });
    expect(r.status).toBe(401);
  });

  it('falha quando usuário não encontrado no banco', async () => {
    const repo = { findById: jest.fn(async () => null), updatePassword: jest.fn() };
    const r = await changePassword({
      data: baseData,
      user: { _id: 'u1' },
      UserRepository: repo,
      PasswordHasher: makeHasher(),
    });
    expect(r.status).toBe(404);
  });
});