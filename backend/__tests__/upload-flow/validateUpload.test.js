const { describe, it, expect } = require('@jest/globals');
const {
  validateFile,
  validateUploadUpdate,
  validateListFilters,
  categorizeFile,
} = require('../../helpers/validate-upload');

describe('categorizeFile', () => {
  it('retorna image para png', () => {
    expect(categorizeFile('image/png')).toBe('image');
  });

  it('retorna image para jpeg', () => {
    expect(categorizeFile('image/jpeg')).toBe('image');
  });

  it('retorna document para pdf', () => {
    expect(categorizeFile('application/pdf')).toBe('document');
  });

  it('retorna null para tipo desconhecido', () => {
    expect(categorizeFile('text/plain')).toBeNull();
  });
});

describe('validateFile', () => {
  const validFile = {
    originalname: 'foto.jpg',
    mimetype: 'image/jpeg',
    size: 1024 * 100,
    filename: '123.jpg',
    path: '/tmp/123.jpg',
  };

  it('aceita arquivo válido', () => {
    expect(validateFile(validFile).isValid).toBe(true);
  });

  it('rejeita null', () => {
    expect(validateFile(null).isValid).toBe(false);
  });

  it('rejeita undefined', () => {
    expect(validateFile(undefined).isValid).toBe(false);
  });

  it('rejeita mimetype inválido', () => {
    expect(validateFile({ ...validFile, mimetype: 'text/plain' }).isValid).toBe(false);
  });

  it('rejeita nome muito longo', () => {
    expect(validateFile({ ...validFile, originalname: 'a'.repeat(256) }).isValid).toBe(false);
  });

  it('rejeita arquivo vazio', () => {
    expect(validateFile({ ...validFile, size: 0 }).isValid).toBe(false);
  });

  it('rejeita imagem acima de 5MB', () => {
    const big = { ...validFile, size: 6 * 1024 * 1024 };
    expect(validateFile(big).isValid).toBe(false);
  });

  it('rejeita documento acima de 10MB', () => {
    const big = { ...validFile, mimetype: 'application/pdf', size: 11 * 1024 * 1024 };
    expect(validateFile(big).isValid).toBe(false);
  });

  it('aceita documento até 10MB', () => {
    const ok = { ...validFile, mimetype: 'application/pdf', size: 9 * 1024 * 1024 };
    expect(validateFile(ok).isValid).toBe(true);
  });

  it('retorna category correta', () => {
    const r = validateFile(validFile);
    expect(r.category).toBe('image');
  });
});

describe('validateUploadUpdate', () => {
  it('aceita description válida', () => {
    expect(validateUploadUpdate({ description: 'Foto do pet' }).isValid).toBe(true);
  });

  it('rejeita description muito longa', () => {
    expect(validateUploadUpdate({ description: 'a'.repeat(501) }).isValid).toBe(false);
  });

  it('aceita entity válida', () => {
    expect(validateUploadUpdate({ entity: { type: 'Pet', _id: 'p1' } }).isValid).toBe(true);
  });

  it('rejeita entity sem type', () => {
    expect(validateUploadUpdate({ entity: { _id: 'p1' } }).isValid).toBe(false);
  });

  it('rejeita entity null', () => {
    expect(validateUploadUpdate({ entity: null }).isValid).toBe(false);
  });

  it('aceita dados vazios', () => {
    expect(validateUploadUpdate({}).isValid).toBe(true);
  });
});

describe('validateListFilters', () => {
  it('aceita filtros vazios com default limit 50', () => {
    const r = validateListFilters({});
    expect(r.isValid).toBe(true);
    expect(r.filters.limit).toBe(50);
  });

  it('aceita category válida', () => {
    expect(validateListFilters({ category: 'image' }).isValid).toBe(true);
  });

  it('rejeita category inválida', () => {
    expect(validateListFilters({ category: 'video' }).isValid).toBe(false);
  });

  it('rejeita limit fora do range', () => {
    expect(validateListFilters({ limit: '200' }).isValid).toBe(false);
    expect(validateListFilters({ limit: '0' }).isValid).toBe(false);
  });

  it('aceita limit válido', () => {
    const r = validateListFilters({ limit: '20' });
    expect(r.isValid).toBe(true);
    expect(r.filters.limit).toBe(20);
  });

  it('repassa entityType e entityId', () => {
    const r = validateListFilters({ entityType: 'Pet', entityId: 'p1' });
    expect(r.filters.entityType).toBe('Pet');
    expect(r.filters.entityId).toBe('p1');
  });
});