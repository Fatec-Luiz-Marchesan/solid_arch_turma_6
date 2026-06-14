const { validateSettings, validateNotifications } = require('../../helpers/validate-settings');

describe('validateSettings helper', () => {
  it('aceita objeto vazio (todos os campos opcionais)', () => {
    expect(validateSettings({}).isValid).toBe(true);
  });

  it('aceita configuração completa válida', () => {
    const r = validateSettings({
      theme: 'dark',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      notifications: { email: false, push: true, sms: true },
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita tema inválido', () => {
    const r = validateSettings({ theme: 'rainbow' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/Tema/i);
  });

  it('rejeita idioma inválido', () => {
    expect(validateSettings({ language: 'jp' }).isValid).toBe(false);
  });

  it('rejeita timezone vazio', () => {
    expect(validateSettings({ timezone: '   ' }).isValid).toBe(false);
  });

  it('rejeita timezone muito longo', () => {
    expect(validateSettings({ timezone: 'x'.repeat(65) }).isValid).toBe(false);
  });

  it('rejeita notifications como array', () => {
    expect(validateSettings({ notifications: [] }).isValid).toBe(false);
  });

  it('rejeita chave de notificação desconhecida', () => {
    expect(validateSettings({ notifications: { sound: true } }).isValid).toBe(false);
  });

  it('rejeita valor de notificação não-booleano', () => {
    expect(validateSettings({ notifications: { email: 'sim' } }).isValid).toBe(false);
  });

  it('validateNotifications aceita undefined', () => {
    expect(validateNotifications(undefined).isValid).toBe(true);
  });
});