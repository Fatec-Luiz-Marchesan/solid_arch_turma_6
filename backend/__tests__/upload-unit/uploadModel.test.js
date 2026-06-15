const { describe, it, expect } = require('@jest/globals');
const Upload = require('../../models/Upload');

describe('Upload Model — validações do schema', () => {
  const validData = {
    originalName: 'foto.jpg',
    storedName: '1234567890.jpg',
    mimetype: 'image/jpeg',
    category: 'image',
    size: 1024 * 100,
    path: 'public/images/uploads/1234567890.jpg',
    uploader: { _id: 'u1', name: 'João' },
  };

  it('cria documento válido sem erros', () => {
    const u = new Upload(validData);
    const err = u.validateSync();
    expect(err).toBeUndefined();
  });

  describe('campo originalName', () => {
    it('é obrigatório', () => {
      const u = new Upload({ ...validData, originalName: undefined });
      const err = u.validateSync();
      expect(err.errors.originalName).toBeDefined();
    });

    it('rejeita nome maior que 255 caracteres', () => {
      const u = new Upload({ ...validData, originalName: 'a'.repeat(256) });
      const err = u.validateSync();
      expect(err.errors.originalName).toBeDefined();
    });

    it('aceita nome de 255 caracteres', () => {
      const u = new Upload({ ...validData, originalName: 'a'.repeat(255) });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('campo storedName', () => {
    it('é obrigatório', () => {
      const u = new Upload({ ...validData, storedName: undefined });
      const err = u.validateSync();
      expect(err.errors.storedName).toBeDefined();
    });
  });

  describe('campo mimetype', () => {
    it('é obrigatório', () => {
      const u = new Upload({ ...validData, mimetype: undefined });
      const err = u.validateSync();
      expect(err.errors.mimetype).toBeDefined();
    });

    it('aceita image/png', () => {
      const u = new Upload({ ...validData, mimetype: 'image/png' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita image/jpeg', () => {
      const u = new Upload({ ...validData, mimetype: 'image/jpeg' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita application/pdf', () => {
      const u = new Upload({ ...validData, mimetype: 'application/pdf', category: 'document' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('rejeita tipo não permitido', () => {
      const u = new Upload({ ...validData, mimetype: 'text/plain' });
      const err = u.validateSync();
      expect(err.errors.mimetype).toBeDefined();
    });
  });

  describe('campo category', () => {
    it('é obrigatório', () => {
      const u = new Upload({ ...validData, category: undefined });
      const err = u.validateSync();
      expect(err.errors.category).toBeDefined();
    });

    it('aceita image', () => {
      const u = new Upload({ ...validData, category: 'image' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('aceita document', () => {
      const u = new Upload({ ...validData, category: 'document' });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('rejeita categoria inválida', () => {
      const u = new Upload({ ...validData, category: 'video' });
      const err = u.validateSync();
      expect(err.errors.category).toBeDefined();
    });
  });

  describe('campo size', () => {
    it('é obrigatório', () => {
      const u = new Upload({ ...validData, size: undefined });
      const err = u.validateSync();
      expect(err.errors.size).toBeDefined();
    });

    it('rejeita valor menor que 1', () => {
      const u = new Upload({ ...validData, size: 0 });
      const err = u.validateSync();
      expect(err.errors.size).toBeDefined();
    });

    it('aceita valor positivo', () => {
      const u = new Upload({ ...validData, size: 500 });
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('campo path', () => {
    it('é obrigatório', () => {
      const u = new Upload({ ...validData, path: undefined });
      const err = u.validateSync();
      expect(err.errors.path).toBeDefined();
    });
  });

  describe('campos opcionais', () => {
    it('entity default é null', () => {
      const u = new Upload(validData);
      expect(u.entity).toBeNull();
    });

    it('aceita entity com dados', () => {
      const u = new Upload({ ...validData, entity: { type: 'Pet', _id: 'p1' } });
      expect(u.entity.type).toBe('Pet');
    });

    it('description é opcional', () => {
      const u = new Upload(validData);
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });

    it('rejeita description maior que 500 caracteres', () => {
      const u = new Upload({ ...validData, description: 'a'.repeat(501) });
      const err = u.validateSync();
      expect(err.errors.description).toBeDefined();
    });

    it('deletedAt default é null', () => {
      const u = new Upload(validData);
      expect(u.deletedAt).toBeNull();
    });
  });

  describe('validações combinadas', () => {
    it('lista todos os erros quando vários campos faltam', () => {
      const u = new Upload({});
      const err = u.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.originalName).toBeDefined();
      expect(err.errors.storedName).toBeDefined();
      expect(err.errors.mimetype).toBeDefined();
      expect(err.errors.category).toBeDefined();
      expect(err.errors.size).toBeDefined();
      expect(err.errors.path).toBeDefined();
    });

    it('passa com todos os campos preenchidos', () => {
      const completo = {
        ...validData,
        entity: { type: 'Pet', _id: 'p1' },
        description: 'Foto do pet',
      };
      const u = new Upload(completo);
      const err = u.validateSync();
      expect(err).toBeUndefined();
    });
  });
});

describe('Upload Model — campos virtuais', () => {
  const base = {
    originalName: 'foto.jpg',
    storedName: '123.jpg',
    mimetype: 'image/jpeg',
    category: 'image',
    size: 2048000,
    path: '/tmp/123.jpg',
    uploader: { _id: 'u1' },
  };

  it('calcula sizeInKB corretamente', () => {
    const u = new Upload(base);
    expect(u.sizeInKB).toBe(2000);
  });

  it('calcula sizeInMB corretamente', () => {
    const u = new Upload(base);
    expect(u.sizeInMB).toBe(1.95);
  });

  it('retorna 0 para sizeInKB quando size é 0', () => {
    const u = new Upload({ ...base, size: 0 });
    expect(u.sizeInKB).toBe(0);
  });

  it('retorna 0 para sizeInMB quando size é 0', () => {
    const u = new Upload({ ...base, size: 0 });
    expect(u.sizeInMB).toBe(0);
  });

  it('inclui sizeInKB e sizeInMB no toJSON', () => {
    const u = new Upload({ ...base, size: 1048576 });
    const obj = u.toJSON();
    expect(obj.sizeInKB).toBe(1024);
    expect(obj.sizeInMB).toBe(1);
  });
});