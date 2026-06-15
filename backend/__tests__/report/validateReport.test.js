const {
  validateReport,
  validateStatus,
  normalizeText,
} = require('../../helpers/validate-report');

describe('validateReport helper', () => {
  const valid = {
    targetType: 'pet',
    targetId: 'pet-123',
    reason: 'spam',
  };

  it('aceita denúncia mínima válida', () => {
    expect(validateReport(valid).isValid).toBe(true);
  });

  it('aceita denúncia completa válida', () => {
    const r = validateReport({
      ...valid,
      description: 'Conteúdo claramente abusivo.',
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita targetType inválido', () => {
    const r = validateReport({ ...valid, targetType: 'comment' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/alvo/i);
  });

  it('rejeita reason inválido', () => {
    const r = validateReport({ ...valid, reason: 'because' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/Motivo/i);
  });

  it('rejeita targetId ausente', () => {
    const { targetId, ...rest } = valid;
    expect(validateReport(rest).isValid).toBe(false);
  });

  it('rejeita targetId vazio', () => {
    expect(validateReport({ ...valid, targetId: '   ' }).isValid).toBe(false);
  });

  it('rejeita targetId muito longo', () => {
    expect(
      validateReport({ ...valid, targetId: 'x'.repeat(101) }).isValid
    ).toBe(false);
  });

  it('rejeita description não-texto', () => {
    expect(validateReport({ ...valid, description: 123 }).isValid).toBe(false);
  });

  it('rejeita description muito longa', () => {
    expect(
      validateReport({ ...valid, description: 'x'.repeat(1001) }).isValid
    ).toBe(false);
  });

  it('acumula múltiplos erros de uma vez', () => {
    const r = validateReport({ targetType: 'x', reason: 'y' });
    expect(r.isValid).toBe(false);
    expect(r.errors.length).toBeGreaterThanOrEqual(3);
  });

  describe('modo partial (PATCH)', () => {
    it('aceita objeto vazio quando partial', () => {
      expect(validateReport({}, { partial: true }).isValid).toBe(true);
    });

    it('valida apenas campos presentes quando partial', () => {
      expect(
        validateReport({ reason: 'fraud' }, { partial: true }).isValid
      ).toBe(true);
      expect(
        validateReport({ reason: 'nope' }, { partial: true }).isValid
      ).toBe(false);
    });
  });

  describe('validateStatus', () => {
    it('aceita status válidos', () => {
      ['pending', 'reviewing', 'resolved', 'dismissed'].forEach((s) => {
        expect(validateStatus(s).isValid).toBe(true);
      });
    });

    it('rejeita status inválido', () => {
      const r = validateStatus('archived');
      expect(r.isValid).toBe(false);
      expect(r.errors[0]).toMatch(/Status/i);
    });
  });

  describe('normalizeText', () => {
    it('colapsa espaços internos e apara as bordas', () => {
      expect(normalizeText('  abuso   grave  ')).toBe('abuso grave');
    });

    it('retorna não-string inalterado', () => {
      expect(normalizeText(42)).toBe(42);
    });
  });
});