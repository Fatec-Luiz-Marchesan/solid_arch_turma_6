const { describe, it, expect } = require('@jest/globals');
const { validateUserEdit } = require('../../helpers/validate-user-edit');

describe('validateUserEdit', () => {
  const valid = {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999998888',
  };

  it('aceita dados válidos', () => {
    expect(validateUserEdit(valid).isValid).toBe(true);
  });

  it('aceita com bio válido', () => {
    expect(validateUserEdit({ ...valid, bio: 'Desenvolvedor fullstack' }).isValid).toBe(true);
  });

  it('aceita com bio vazio', () => {
    expect(validateUserEdit({ ...valid, bio: '' }).isValid).toBe(true);
  });

  it('rejeita sem nome', () => {
    const r = validateUserEdit({ ...valid, name: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/nome/i);
  });

  it('rejeita nome muito curto', () => {
    expect(validateUserEdit({ ...valid, name: 'A' }).isValid).toBe(false);
  });

  it('rejeita nome muito longo', () => {
    expect(validateUserEdit({ ...valid, name: 'a'.repeat(81) }).isValid).toBe(false);
  });

  it('rejeita sem email', () => {
    const r = validateUserEdit({ ...valid, email: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/e-mail/i);
  });

  it('rejeita email com formato inválido', () => {
    const r = validateUserEdit({ ...valid, email: 'invalido' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/formato/i);
  });

  it('rejeita sem telefone', () => {
    const r = validateUserEdit({ ...valid, phone: '' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/telefone/i);
  });

  it('rejeita telefone muito curto', () => {
    expect(validateUserEdit({ ...valid, phone: '1234567' }).isValid).toBe(false);
  });

  it('rejeita telefone muito longo', () => {
    expect(validateUserEdit({ ...valid, phone: '1'.repeat(21) }).isValid).toBe(false);
  });

  it('rejeita bio muito longo', () => {
    const r = validateUserEdit({ ...valid, bio: 'a'.repeat(201) });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/bio/i);
  });

  it('rejeita bio não-string', () => {
    expect(validateUserEdit({ ...valid, bio: 123 }).isValid).toBe(false);
  });

  it('rejeita quando senhas não conferem', () => {
    const r = validateUserEdit({ ...valid, password: 'abc123', confirmpassword: 'xyz' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/senhas/i);
  });

  it('rejeita senha com menos de 6 caracteres', () => {
    const r = validateUserEdit({ ...valid, password: '12345', confirmpassword: '12345' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/pelo menos/i);
  });

  it('aceita sem password (não obrigatório na edição)', () => {
    expect(validateUserEdit(valid).isValid).toBe(true);
  });

  it('rejeita dados nulos', () => {
    expect(validateUserEdit(null).isValid).toBe(false);
  });
});