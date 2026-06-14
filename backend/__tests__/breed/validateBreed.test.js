const { describe, it, expect } = require('@jest/globals');
const {
  validateBreed,
  normalizeName,
} = require('../../helpers/validate-breed');

describe('validateBreed helper', () => {
  it('aceita raça mínima válida', () => {
    expect(validateBreed({ name: 'Labrador', species: 'dog' }).isValid).toBe(true);
  });

  it('aceita raça completa válida', () => {
    const r = validateBreed({
      name: 'Border Collie',
      species: 'dog',
      size: 'medium',
      description: 'Cão de pastoreio muito inteligente.',
      temperament: ['inteligente', 'ativo'],
      lifeExpectancy: 13,
      origin: 'Escócia',
      hypoallergenic: false,
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita nome ausente', () => {
    const r = validateBreed({ species: 'dog' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/nome/i);
  });

  it('rejeita nome muito curto', () => {
    expect(validateBreed({ name: 'L', species: 'dog' }).isValid).toBe(false);
  });

  it('rejeita nome muito longo', () => {
    expect(
      validateBreed({ name: 'x'.repeat(51), species: 'dog' }).isValid
    ).toBe(false);
  });

  it('rejeita espécie ausente', () => {
    expect(validateBreed({ name: 'Labrador' }).isValid).toBe(false);
  });

  it('rejeita espécie inválida', () => {
    const r = validateBreed({ name: 'Dragão', species: 'dragon' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/esp[eé]cie/i);
  });

  it('rejeita tamanho inválido', () => {
    expect(
      validateBreed({ name: 'Labrador', species: 'dog', size: 'huge' }).isValid
    ).toBe(false);
  });

  it('rejeita descrição muito longa', () => {
    expect(
      validateBreed({
        name: 'Labrador',
        species: 'dog',
        description: 'x'.repeat(501),
      }).isValid
    ).toBe(false);
  });

  it('rejeita temperament que não é lista', () => {
    expect(
      validateBreed({
        name: 'Labrador',
        species: 'dog',
        temperament: 'amigável',
      }).isValid
    ).toBe(false);
  });

  it('rejeita temperament com item vazio', () => {
    expect(
      validateBreed({
        name: 'Labrador',
        species: 'dog',
        temperament: ['', 'ok'],
      }).isValid
    ).toBe(false);
  });

  it('rejeita temperament com muitos itens', () => {
    expect(
      validateBreed({
        name: 'Labrador',
        species: 'dog',
        temperament: Array.from({ length: 11 }, (_, i) => `t${i}`),
      }).isValid
    ).toBe(false);
  });

  it('rejeita lifeExpectancy fora do intervalo', () => {
    expect(
      validateBreed({ name: 'Labrador', species: 'dog', lifeExpectancy: 99 })
        .isValid
    ).toBe(false);
  });

  it('rejeita lifeExpectancy não numérico', () => {
    expect(
      validateBreed({ name: 'Labrador', species: 'dog', lifeExpectancy: 'dez' })
        .isValid
    ).toBe(false);
  });

  it('rejeita origin muito longo', () => {
    expect(
      validateBreed({ name: 'Labrador', species: 'dog', origin: 'x'.repeat(101) })
        .isValid
    ).toBe(false);
  });

  it('rejeita hypoallergenic não booleano', () => {
    expect(
      validateBreed({ name: 'Labrador', species: 'dog', hypoallergenic: 'sim' })
        .isValid
    ).toBe(false);
  });

  describe('modo parcial (update)', () => {
    it('aceita objeto vazio', () => {
      expect(validateBreed({}, { partial: true }).isValid).toBe(true);
    });

    it('aceita apenas um campo válido', () => {
      expect(validateBreed({ size: 'large' }, { partial: true }).isValid).toBe(
        true
      );
    });

    it('ainda valida campos presentes', () => {
      expect(
        validateBreed({ species: 'dragon' }, { partial: true }).isValid
      ).toBe(false);
    });
  });

  describe('normalizeName', () => {
    it('colapsa espaços internos e apara as bordas', () => {
      expect(normalizeName('  Golden   Retriever  ')).toBe('Golden Retriever');
    });

    it('retorna valor não-string inalterado', () => {
      expect(normalizeName(123)).toBe(123);
    });
  });
});