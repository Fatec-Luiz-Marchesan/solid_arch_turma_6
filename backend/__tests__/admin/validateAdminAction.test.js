const { describe, it, expect } = require('@jest/globals');
const { validateAdminAction } = require('../../helpers/validate-admin-action');

describe('validateAdminAction helper', () => {
  it('aceita ID válido no formato ObjectId', () => {
    const r = validateAdminAction({ targetId: '507f1f77bcf86cd799439011' });
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('rejeita ID ausente', () => {
    const r = validateAdminAction({});
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/id/i);
  });

  it('rejeita ID em formato inválido', () => {
    const r = validateAdminAction({ targetId: 'abc' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/inválido/i);
  });

  it('rejeita ID que não é string', () => {
    const r = validateAdminAction({ targetId: 123 });
    expect(r.isValid).toBe(false);
  });
});