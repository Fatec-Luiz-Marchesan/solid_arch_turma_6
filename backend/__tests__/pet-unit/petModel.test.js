const { describe, it, expect } = require('@jest/globals');
const Pet = require('../../models/Pet');

describe('Pet Model — validações do schema', () => {
  const validData = {
    name: 'Rex',
    age: 3,
    weight: 12.5,
    color: 'Marrom',
    images: ['foto1.jpg', 'foto2.jpg'],
  };

  it('cria documento válido sem erros', () => {
    const pet = new Pet(validData);
    const err = pet.validateSync();
    expect(err).toBeUndefined();
  });

  describe('campo name', () => {
    it('é obrigatório', () => {
      const pet = new Pet({ ...validData, name: undefined });
      const err = pet.validateSync();
      expect(err.errors.name).toBeDefined();
    });

    it('aceita string', () => {
      const pet = new Pet({ ...validData, name: 'Bolinha' });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });

    it('converte número para string automaticamente', () => {
      const pet = new Pet({ ...validData, name: 123 });
      expect(pet.name).toBe('123');
    });
  });

  describe('campo age', () => {
    it('é obrigatório', () => {
      const pet = new Pet({ ...validData, age: undefined });
      const err = pet.validateSync();
      expect(err.errors.age).toBeDefined();
    });

    it('aceita números inteiros', () => {
      const pet = new Pet({ ...validData, age: 5 });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
      expect(pet.age).toBe(5);
    });

    it('aceita números decimais', () => {
      const pet = new Pet({ ...validData, age: 2.5 });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });

    it('rejeita valor que não pode virar número', () => {
      const pet = new Pet({ ...validData, age: 'três anos' });
      const err = pet.validateSync();
      expect(err.errors.age).toBeDefined();
    });
  });

  describe('campo weight', () => {
    it('é obrigatório', () => {
      const pet = new Pet({ ...validData, weight: undefined });
      const err = pet.validateSync();
      expect(err.errors.weight).toBeDefined();
    });

    it('aceita números', () => {
      const pet = new Pet({ ...validData, weight: 15.7 });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });

    it('rejeita valor que não pode virar número', () => {
      const pet = new Pet({ ...validData, weight: 'pesado' });
      const err = pet.validateSync();
      expect(err.errors.weight).toBeDefined();
    });
  });

  describe('campo color', () => {
    it('é obrigatório', () => {
      const pet = new Pet({ ...validData, color: undefined });
      const err = pet.validateSync();
      expect(err.errors.color).toBeDefined();
    });

    it('aceita string', () => {
      const pet = new Pet({ ...validData, color: 'Preto' });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('campo images', () => {
   it('aceita undefined (comportamento legado do Mongoose para Array)', () => {
  const pet = new Pet({ ...validData, images: undefined });
  const err = pet.validateSync();
  expect(err).toBeUndefined();
});

    it('aceita array de strings', () => {
      const pet = new Pet({ ...validData, images: ['a.jpg', 'b.png'] });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
      expect(pet.images).toHaveLength(2);
    });

    it('aceita array vazio (passa na validação de required)', () => {
      const pet = new Pet({ ...validData, images: [] });
      const err = pet.validateSync();

      expect(err).toBeUndefined();
    });
  });

  describe('campo description', () => {
    it('é opcional', () => {
      const pet = new Pet({ ...validData, description: undefined });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita string longa', () => {
      const longDesc = 'a'.repeat(500);
      const pet = new Pet({ ...validData, description: longDesc });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('campo available', () => {
    it('é opcional', () => {
      const pet = new Pet({ ...validData, available: undefined });
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita true', () => {
      const pet = new Pet({ ...validData, available: true });
      expect(pet.available).toBe(true);
    });

    it('aceita false', () => {
      const pet = new Pet({ ...validData, available: false });
      expect(pet.available).toBe(false);
    });
  });

  describe('campos user e adopter (Object)', () => {
    it('user é opcional', () => {
      const pet = new Pet(validData);
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita objeto user com dados do dono', () => {
      const userData = {
        _id: 'u1',
        name: 'João',
        phone: '11999999999',
        image: 'avatar.jpg',
      };
      const pet = new Pet({ ...validData, user: userData });
      expect(pet.user.name).toBe('João');
      expect(pet.user.phone).toBe('11999999999');
    });

    it('adopter é opcional', () => {
      const pet = new Pet(validData);
      expect(pet.adopter).toBeUndefined();
    });

    it('aceita objeto adopter', () => {
      const adopterData = { _id: 'u2', name: 'Maria' };
      const pet = new Pet({ ...validData, adopter: adopterData });
      expect(pet.adopter.name).toBe('Maria');
    });
  });

  describe('timestamps', () => {
    it('inicializa createdAt e updatedAt como undefined antes de save', () => {
      const pet = new Pet(validData);
  
      expect(pet.createdAt).toBeUndefined();
      expect(pet.updatedAt).toBeUndefined();
    });
  });

  describe('múltiplas validações combinadas', () => {
  it('lista todos os erros quando vários campos faltam', () => {
  const pet = new Pet({});
  const err = pet.validateSync();
  expect(err).toBeDefined();
  expect(err.errors.name).toBeDefined();
  expect(err.errors.age).toBeDefined();
  expect(err.errors.weight).toBeDefined();
  expect(err.errors.color).toBeDefined();
});

    it('passa em todas as validações com dados completos', () => {
      const completo = {
        name: 'Rex',
        age: 3,
        description: 'Cachorro dócil',
        weight: 12,
        color: 'Caramelo',
        images: ['1.jpg'],
        available: true,
        user: { _id: 'u1', name: 'João' },
      };
      const pet = new Pet(completo);
      const err = pet.validateSync();
      expect(err).toBeUndefined();
    });
  });
});