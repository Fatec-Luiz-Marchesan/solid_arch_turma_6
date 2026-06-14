const { describe, it, expect, beforeEach } = require('@jest/globals');

jest.mock('../../helpers/get-token', () => () => 'fake-token');
jest.mock('../../helpers/get-user-by-token', () => jest.fn());

jest.mock('../../usecases/user/changePassword', () => ({
  changePassword: jest.fn(),
}));
jest.mock('../../usecases/user/deleteAccount', () => ({
  deleteAccount: jest.fn(),
}));
jest.mock('../../usecases/user/searchUsers', () => ({
  searchUsers: jest.fn(),
}));

const getUserByToken = require('../../helpers/get-user-by-token');
const { changePassword } = require('../../usecases/user/changePassword');
const { deleteAccount } = require('../../usecases/user/deleteAccount');
const { searchUsers } = require('../../usecases/user/searchUsers');
const UserAccountController = require('../../controllers/UserAccountController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('UserAccountController — testes de unidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserByToken.mockResolvedValue({ _id: 'u1', name: 'João' });
  });

  describe('changePassword', () => {
    it('retorna 200 quando use case sucede', async () => {
      changePassword.mockResolvedValueOnce({
        success: true,
        status: 200,
        message: 'Senha atualizada!',
      });
      const req = {
        body: {
          currentPassword: 'old',
          newPassword: 'new123',
          confirmNewPassword: 'new123',
        },
      };
      const res = makeRes();

      await UserAccountController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha atualizada!' });
    });

    it('retorna erro quando use case falha', async () => {
      changePassword.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Senha atual incorreta!'],
      });
      const req = { body: {} };
      const res = makeRes();

      await UserAccountController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha atual incorreta!' });
    });

    it('passa body, user e dependências para o use case', async () => {
      changePassword.mockResolvedValueOnce({ success: true, status: 200, message: 'ok' });
      const req = { body: { currentPassword: 'a' } };
      await UserAccountController.changePassword(req, makeRes());

      const args = changePassword.mock.calls[0][0];
      expect(args.data).toEqual({ currentPassword: 'a' });
      expect(args.user).toEqual({ _id: 'u1', name: 'João' });
      expect(args.UserRepository).toBeDefined();
      expect(args.PasswordHasher).toBeDefined();
    });
  });

  describe('deleteAccount', () => {
    it('retorna 200 quando conta é deletada', async () => {
      deleteAccount.mockResolvedValueOnce({
        success: true,
        status: 200,
        message: 'Conta excluída!',
      });
      const req = { body: { password: 'minhaSenha' } };
      const res = makeRes();

      await UserAccountController.deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conta excluída!' });
    });

    it('retorna erro quando senha incorreta', async () => {
      deleteAccount.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Senha incorreta!'],
      });
      const req = { body: { password: 'errada' } };
      const res = makeRes();

      await UserAccountController.deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('passa dependências corretas para o use case', async () => {
      deleteAccount.mockResolvedValueOnce({ success: true, status: 200, message: 'ok' });
      await UserAccountController.deleteAccount({ body: { password: 'x' } }, makeRes());

      const args = deleteAccount.mock.calls[0][0];
      expect(args.user).toEqual({ _id: 'u1', name: 'João' });
      expect(args.UserRepository).toBeDefined();
      expect(args.PasswordHasher).toBeDefined();
    });
  });

  describe('search', () => {
    it('retorna 200 com lista de usuários', async () => {
      searchUsers.mockResolvedValueOnce({
        success: true,
        status: 200,
        users: [{ _id: 'u2', name: 'Maria' }],
      });
      const req = { query: { q: 'mar' } };
      const res = makeRes();

      await UserAccountController.search(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: [{ _id: 'u2', name: 'Maria' }],
      });
    });

    it('retorna erro quando query inválida', async () => {
      searchUsers.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Termo de busca inválido!'],
      });
      const req = { query: { q: 'a' } };
      const res = makeRes();

      await UserAccountController.search(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('passa o termo de busca do query string ao use case', async () => {
      searchUsers.mockResolvedValueOnce({ success: true, status: 200, users: [] });
      const req = { query: { q: 'joão' } };
      await UserAccountController.search(req, makeRes());

      const args = searchUsers.mock.calls[0][0];
      expect(args.query).toBe('joão');
      expect(args.user).toEqual({ _id: 'u1', name: 'João' });
    });
  });
});