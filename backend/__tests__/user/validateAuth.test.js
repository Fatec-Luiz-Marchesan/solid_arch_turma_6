const { describe, it, expect } = require('@jest/globals');
const { validateRegister, validateLogin } = require('../../helpers/validate-auth');

describe('validateRegister', () => {
  const valid = {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999998888',
    password: 'senha123',
    confirmpassword: 'senha123',
  };

  it('aceita dados válidos', () => {
    expect(validateRegister(valid).isValid).toBe(true);
  });

  it('rejeita sem nome', () => {
    const r = validateRegister({ ...valid, name: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/nome/i);
  });

  it('rejeita nome muito curto', () => {
    expect(validateRegister({ ...valid, name: 'A' }).isValid).toBe(false);
  });

  it('rejeita nome muito longo', () => {
    expect(validateRegister({ ...valid, name: 'a'.repeat(81) }).isValid).toBe(false);
  });

  it('rejeita sem email', () => {
    const r = validateRegister({ ...valid, email: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/e-mail/i);
  });

  it('rejeita email sem formato válido', () => {
    const r = validateRegister({ ...valid, email: 'invalido' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/formato/i);
  });

  it('rejeita email sem @', () => {
    expect(validateRegister({ ...valid, email: 'joaoemail.com' }).isValid).toBe(false);
  });

  it('rejeita sem telefone', () => {
    const r = validateRegister({ ...valid, phone: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/telefone/i);
  });

  it('rejeita telefone muito curto', () => {
    expect(validateRegister({ ...valid, phone: '1234567' }).isValid).toBe(false);
  });

  it('rejeita telefone muito longo', () => {
    expect(validateRegister({ ...valid, phone: '1'.repeat(21) }).isValid).toBe(false);
  });

  it('rejeita sem senha', () => {
    const r = validateRegister({ ...valid, password: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/senha/i);
  });

  it('rejeita senha com menos de 6 caracteres', () => {
    const r = validateRegister({ ...valid, password: '12345', confirmpassword: '12345' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/pelo menos/i);
  });

  it('rejeita sem confirmação de senha', () => {
    const r = validateRegister({ ...valid, confirmpassword: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/confirmação/i);
  });

  it('rejeita quando senha e confirmação não conferem', () => {
    const r = validateRegister({ ...valid, confirmpassword: 'outra' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/iguais/i);
  });

  it('rejeita dados nulos', () => {
    expect(validateRegister(null).isValid).toBe(false);
  });
});

describe('validateLogin', () => {
  const valid = { email: 'joao@email.com', password: 'senha123' };

  it('aceita dados válidos', () => {
    expect(validateLogin(valid).isValid).toBe(true);
  });

  it('rejeita sem email', () => {
    const r = validateLogin({ ...valid, email: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/e-mail/i);
  });

  it('rejeita email com formato inválido', () => {
    expect(validateLogin({ ...valid, email: 'invalido' }).isValid).toBe(false);
  });

  it('rejeita sem senha', () => {
    const r = validateLogin({ ...valid, password: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/senha/i);
  });

  it('rejeita dados nulos', () => {
    expect(validateLogin(null).isValid).toBe(false);
  });
});