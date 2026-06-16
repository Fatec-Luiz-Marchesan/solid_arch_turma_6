const { describe, it, expect } = require('@jest/globals');
const { validateDiet, normalizeName } = require('../../helpers/validate-diet');

describe('validateDiet helper', () => {
  it('aceita dieta mínima válida', () => {
    expect(validateDiet({ name: 'Dieta Proteica', type: 'high-protein' }).isValid).toBe(true);
  });

  it('aceita dieta completa válida', () => {
    const r = validateDiet({
      name: 'Dieta Low Carb Avançada',
      type: 'low-carb',
      goal: 'Perder 5kg em 3 meses',
      dailyCalories: 1800,
      durationDays: 90,
      restrictions: ['glúten', 'lactose'],
      notes: 'Evitar carboidratos simples após as 18h.',
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita nome ausente', () => {
    const r = validateDiet({ type: 'low-carb' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/nome/i);
  });

  it('rejeita nome muito curto', () => {
    expect(validateDiet({ name: 'D', type: 'low-carb' }).isValid).toBe(false);
  });

  it('rejeita nome muito longo', () => {
    expect(validateDiet({ name: 'x'.repeat(101), type: 'low-carb' }).isValid).toBe(false);
  });

  it('rejeita tipo ausente', () => {
    const r = validateDiet({ name: 'Dieta Proteica' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/tipo/i);
  });

  it('rejeita tipo inválido', () => {
    const r = validateDiet({ name: 'Dieta X', type: 'keto-extreme' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/tipo/i);
  });

  it('rejeita goal muito longo', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', goal: 'x'.repeat(301) }).isValid
    ).toBe(false);
  });

  it('rejeita goal não-string', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', goal: 123 }).isValid
    ).toBe(false);
  });

  it('rejeita dailyCalories não numérico', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', dailyCalories: 'mil' }).isValid
    ).toBe(false);
  });

  it('rejeita dailyCalories fora do intervalo', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', dailyCalories: 15000 }).isValid
    ).toBe(false);
  });

  it('aceita dailyCalories nulo', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', dailyCalories: null }).isValid
    ).toBe(true);
  });

  it('rejeita durationDays não inteiro', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', durationDays: 1.5 }).isValid
    ).toBe(false);
  });

  it('rejeita durationDays fora do intervalo', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', durationDays: 5000 }).isValid
    ).toBe(false);
  });

  it('rejeita durationDays menor que 1', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', durationDays: 0 }).isValid
    ).toBe(false);
  });

  it('rejeita restrictions que não é lista', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', restrictions: 'glúten' }).isValid
    ).toBe(false);
  });

  it('rejeita restrictions com item vazio', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', restrictions: ['', 'lactose'] }).isValid
    ).toBe(false);
  });

  it('rejeita restrictions com muitos itens', () => {
    expect(
      validateDiet({
        name: 'Dieta X',
        type: 'other',
        restrictions: Array.from({ length: 21 }, (_, i) => `item${i}`),
      }).isValid
    ).toBe(false);
  });

  it('rejeita restriction com item muito longo', () => {
    expect(
      validateDiet({
        name: 'Dieta X',
        type: 'other',
        restrictions: ['x'.repeat(51)],
      }).isValid
    ).toBe(false);
  });

  it('rejeita notes muito longo', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', notes: 'x'.repeat(1001) }).isValid
    ).toBe(false);
  });

  it('rejeita notes não-string', () => {
    expect(
      validateDiet({ name: 'Dieta X', type: 'other', notes: 999 }).isValid
    ).toBe(false);
  });

  describe('modo parcial (update)', () => {
    it('aceita objeto vazio', () => {
      expect(validateDiet({}, { partial: true }).isValid).toBe(true);
    });

    it('aceita apenas um campo válido', () => {
      expect(validateDiet({ dailyCalories: 2000 }, { partial: true }).isValid).toBe(true);
    });

    it('ainda valida campos presentes', () => {
      expect(
        validateDiet({ type: 'invalido' }, { partial: true }).isValid
      ).toBe(false);
    });
  });

  describe('normalizeName', () => {
    it('colapsa espaços internos e apara as bordas', () => {
      expect(normalizeName('  Dieta   Low  Carb  ')).toBe('Dieta Low Carb');
    });

    it('retorna valor não-string inalterado', () => {
      expect(normalizeName(123)).toBe(123);
    });
  });
});
describe('validateDiet - mealsPerDay', () => {
  const valid = { name: 'Dieta Proteica', type: 'high-protein' };

  it('aceita ausência de mealsPerDay', () => {
    expect(validateDiet(valid).isValid).toBe(true);
  });

  it('aceita inteiro válido', () => {
    expect(validateDiet({ ...valid, mealsPerDay: 5 }).isValid).toBe(true);
  });

  it('aceita null', () => {
    expect(validateDiet({ ...valid, mealsPerDay: null }).isValid).toBe(true);
  });

  it('rejeita número não-inteiro', () => {
    expect(validateDiet({ ...valid, mealsPerDay: 3.5 }).isValid).toBe(false);
  });

  it('rejeita abaixo do mínimo', () => {
    expect(validateDiet({ ...valid, mealsPerDay: 0 }).isValid).toBe(false);
  });

  it('rejeita acima do máximo', () => {
    expect(validateDiet({ ...valid, mealsPerDay: 13 }).isValid).toBe(false);
  });

  it('rejeita valor não-numérico', () => {
    expect(validateDiet({ ...valid, mealsPerDay: '6' }).isValid).toBe(false);
  });
});
