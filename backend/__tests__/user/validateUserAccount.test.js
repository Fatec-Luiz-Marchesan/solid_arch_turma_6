const { describe, it, expect } = require('@jest/globals');
const {
  validatePasswordChange,
  validateSearchQuery,
  validateDeleteAccount,
} = require('../../helpers/validate-user-account');

describe('validatePasswordChange', () => {
  const validData = {
    currentPassword: 'oldpass123',
    newPassword: 'newpass456',
    confirmNewPassword: 'newpass456',
  };

  it('aceita dados válidos', () => {
    const r = validatePasswordChange(validData);
    expect(r.isValid).toBe(true);
  });

  it('rejeita sem currentPassword', () => {
    const r = validatePasswordChange({ ...validData, currentPassword: '' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita sem newPassword', () => {
    const r = validatePasswordChange({ ...validData, newPassword: '' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita newPassword com menos de 6 caracteres', () => {
    const r = validatePasswordChange({
      ...validData,
      newPassword: '123',
      confirmNewPassword: '123',
    });
    expect(r.isValid).toBe(false);
  });

  it('rejeita newPassword com mais de 100 caracteres', () => {
    const r = validatePasswordChange({
      ...validData,
      newPassword: 'a'.repeat(101),
      confirmNewPassword: 'a'.repeat(101),
    });
    expect(r.isValid).toBe(false);
  });

  it('rejeita newPassword não-string', () => {
    const r = validatePasswordChange({ ...validData, newPassword: 123456 });
    expect(r.isValid).toBe(false);
  });

  it('rejeita sem confirmNewPassword', () => {
    const r = validatePasswordChange({ ...validData, confirmNewPassword: '' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita quando newPassword != confirmNewPassword', () => {
    const r = validatePasswordChange({
      ...validData,
      confirmNewPassword: 'different',
    });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/conferem/);
  });

  it('rejeita quando newPassword igual à currentPassword', () => {
    const r = validatePasswordChange({
      currentPassword: 'samepass',
      newPassword: 'samepass',
      confirmNewPassword: 'samepass',
    });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/diferente/);
  });
});

describe('validateSearchQuery', () => {
  it('aceita termo válido', () => {
    expect(validateSearchQuery('joão').isValid).toBe(true);
  });

  it('rejeita termo nulo', () => {
    expect(validateSearchQuery(null).isValid).toBe(false);
  });

  it('rejeita termo não-string', () => {
    expect(validateSearchQuery(123).isValid).toBe(false);
  });

  it('rejeita termo muito curto', () => {
    expect(validateSearchQuery('a').isValid).toBe(false);
  });

  it('rejeita termo muito longo', () => {
    expect(validateSearchQuery('a'.repeat(101)).isValid).toBe(false);
  });
});

describe('validateDeleteAccount', () => {
  it('aceita com senha', () => {
    expect(validateDeleteAccount({ password: 'abc123' }).isValid).toBe(true);
  });

  it('rejeita sem senha', () => {
    expect(validateDeleteAccount({}).isValid).toBe(false);
  });
});