const { describe, it, expect } = require('@jest/globals');
const User = require('../../models/User');

describe('User Model — validações do schema', () => {
  const validData = {
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'hashedPassword123',
  };

  it('cria documento válido sem erros', () => {
    const u = new User(validData);
    const err = u.validateSync();
    expect(err).toBeUndefined();
  });

  describe('campo name', () => {
    it('é obrigatório', () => {
      const u = new User({ ...validData, name: undefined });
      const err = u.validateSync();
      expect(err.errors.name).toBeDefined();
    });

    it('aceita string', () => {
      const u = new User({ ...validData, name: 'Maria' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
      expect(u.name).toBe('Maria');
    });

    it('converte número para string', () => {
      const u = new User({ ...validData, name: 123 });
      expect(u.name).toBe('123');
    });
  });

  describe('campo email', () => {
    it('é obrigatório', () => {
      const u = new User({ ...validData, email: undefined });
      const err = u.validateSync();
      expect(err.errors.email).toBeDefined();
    });

    it('aceita string de email', () => {
      const u = new User({ ...validData, email: 'teste@teste.com' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('campo password', () => {
    it('é obrigatório', () => {
      const u = new User({ ...validData, password: undefined });
      const err = u.validateSync();
      expect(err.errors.password).toBeDefined();
    });

    it('aceita string', () => {
      const u = new User({ ...validData, password: 'qualquerHash' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('campos opcionais', () => {
    it('image é opcional', () => {
      const u = new User(validData);
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita image quando fornecida', () => {
      const u = new User({ ...validData, image: 'avatar.png' });
      expect(u.image).toBe('avatar.png');
    });

    it('phone é opcional', () => {
      const u = new User(validData);
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita phone quando fornecido', () => {
      const u = new User({ ...validData, phone: '11999999999' });
      expect(u.phone).toBe('11999999999');
    });
  });

  describe('validações combinadas', () => {
    it('lista todos os erros quando vários campos faltam', () => {
      const u = new User({});
      const err = u.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    });

    it('passa com todos os campos preenchidos', () => {
      const completo = {
        name: 'Ana',
        email: 'ana@example.com',
        password: 'senhaHash',
        image: 'foto.jpg',
        phone: '21988888888',
      };
      const u = new User(completo);
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('timestamps', () => {
    it('createdAt e updatedAt começam undefined antes de salvar', () => {
      const u = new User(validData);
      expect(u.createdAt).toBeUndefined();
      expect(u.updatedAt).toBeUndefined();
    });
  });
  describe('campo bio', () => {
    it('é opcional e tem default vazio', () => {
      const u = new User(validData);
      const err = u.validateSync();
      expect(err).toBeUndefined();
      expect(u.bio).toBe('');
    });

    it('aceita bio quando fornecido', () => {
      const u = new User({ ...validData, bio: 'Dev fullstack' });
      expect(u.bio).toBe('Dev fullstack');
    });

    it('aplica trim no bio', () => {
      const u = new User({ ...validData, bio: '  Olá mundo  ' });
      expect(u.bio).toBe('Olá mundo');
    });
  });
});