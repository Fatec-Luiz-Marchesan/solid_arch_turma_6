const { describe, it, expect } = require('@jest/globals');
const { dispatchNotification } = require('../../usecases/notification/dispatchNotification');

const baseNotif = {
  _id: 'n1',
  title: 'Teste',
  channels: ['in_app', 'email'],
  recipient: { _id: 'u1' },
};

const makeAdapters = (overrides = {}) => ({
  in_app: { send: jest.fn(async () => true) },
  email: { send: jest.fn(async () => true) },
  push: { send: jest.fn(async () => true) },
  ...overrides,
});

describe('dispatchNotification', () => {
  it('dispara para todos os canais configurados', async () => {
    const adapters = makeAdapters();
    const r = await dispatchNotification({
      notification: baseNotif,
      channelAdapters: adapters,
    });
    expect(r.success).toBe(true);
    expect(adapters.in_app.send).toHaveBeenCalled();
    expect(adapters.email.send).toHaveBeenCalled();
    expect(adapters.push.send).not.toHaveBeenCalled();
  });

  it('reporta falha individual de adapter sem quebrar os outros', async () => {
    const adapters = makeAdapters({
      email: {
        send: jest.fn(async () => {
          throw new Error('SMTP fora do ar');
        }),
      },
    });
    const r = await dispatchNotification({
      notification: baseNotif,
      channelAdapters: adapters,
    });
    expect(r.success).toBe(true); // pelo menos in_app passou
    expect(r.results.find((x) => x.channel === 'email').success).toBe(false);
    expect(r.results.find((x) => x.channel === 'in_app').success).toBe(true);
  });

  it('retorna 502 quando todos os canais falham', async () => {
    const adapters = makeAdapters({
      in_app: { send: jest.fn(async () => { throw new Error('x'); }) },
      email: { send: jest.fn(async () => { throw new Error('x'); }) },
    });
    const r = await dispatchNotification({
      notification: baseNotif,
      channelAdapters: adapters,
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(502);
  });

  it('lida com adapter ausente sem quebrar', async () => {
    const r = await dispatchNotification({
      notification: { ...baseNotif, channels: ['carrier_pigeon'] },
      channelAdapters: {},
    });
    expect(r.success).toBe(false);
    expect(r.results[0].reason).toMatch(/Adapter não configurado/);
  });

  it('rejeita notificação sem canais', async () => {
    const r = await dispatchNotification({
      notification: { ...baseNotif, channels: [] },
      channelAdapters: makeAdapters(),
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });
});