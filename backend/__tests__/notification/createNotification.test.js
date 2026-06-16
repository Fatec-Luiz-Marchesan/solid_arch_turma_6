const { describe, it, expect, beforeEach } = require('@jest/globals');
const { createNotification } = require('../../usecases/notification/createNotification');

const makeRepo = () => ({
  create: jest.fn(async (d) => ({ _id: 'n1', ...d })),
});

const makeDispatcher = (shouldFail = false) => ({
  dispatch: jest.fn(async () => {
    if (shouldFail) throw new Error('Dispatch falhou');
    return true;
  }),
});

const baseData = {
  type: 'message_received',
  title: 'Nova mensagem',
  body: 'Você recebeu uma mensagem',
  recipientId: 'u2',
};

describe('createNotification', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria notificação válida', async () => {
    const repo = makeRepo();
    const dispatcher = makeDispatcher();
    const r = await createNotification({
      data: baseData,
      sender: { _id: 'u1', name: 'João' },
      NotificationRepository: repo,
      NotificationDispatcher: dispatcher,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    expect(repo.create).toHaveBeenCalled();
  });

  it('chama o dispatcher após criar', async () => {
    const repo = makeRepo();
    const dispatcher = makeDispatcher();
    await createNotification({
      data: baseData,
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: dispatcher,
    });
    expect(dispatcher.dispatch).toHaveBeenCalled();
  });

  it('não falha quando o dispatcher quebra', async () => {
    const repo = makeRepo();
    const dispatcher = makeDispatcher(true);
    const r = await createNotification({
      data: baseData,
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: dispatcher,
    });
    expect(r.success).toBe(true);
  });

  it('funciona sem dispatcher (degradação graciosa)', async () => {
    const repo = makeRepo();
    const r = await createNotification({
      data: baseData,
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: null,
    });
    expect(r.success).toBe(true);
  });

  it('aceita sem sender (notificação do sistema)', async () => {
    const repo = makeRepo();
    const r = await createNotification({
      data: { ...baseData, type: 'system' },
      sender: null,
      NotificationRepository: repo,
      NotificationDispatcher: makeDispatcher(),
    });
    expect(r.success).toBe(true);
    expect(repo.create.mock.calls[0][0].sender).toBeNull();
  });

  it('rejeita dados inválidos', async () => {
    const r = await createNotification({
      data: { ...baseData, type: 'foo' },
      sender: { _id: 'u1' },
      NotificationRepository: makeRepo(),
      NotificationDispatcher: makeDispatcher(),
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });

  it('usa channels default in_app quando não informado', async () => {
    const repo = makeRepo();
    await createNotification({
      data: baseData,
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: makeDispatcher(),
    });
    expect(repo.create.mock.calls[0][0].channels).toEqual(['in_app']);
  });

  it('aceita channels customizados', async () => {
    const repo = makeRepo();
    await createNotification({
      data: { ...baseData, channels: ['in_app', 'email'] },
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: makeDispatcher(),
    });
    expect(repo.create.mock.calls[0][0].channels).toEqual(['in_app', 'email']);
  });

  it('aceita metadata e relatedEntity', async () => {
    const repo = makeRepo();
    await createNotification({
      data: {
        ...baseData,
        metadata: { messageId: 'msg1' },
        relatedEntity: { type: 'Message', _id: 'msg1' },
      },
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: makeDispatcher(),
    });
    expect(repo.create.mock.calls[0][0].metadata).toEqual({ messageId: 'msg1' });
    expect(repo.create.mock.calls[0][0].relatedEntity).toEqual({
      type: 'Message',
      _id: 'msg1',
    });
  });
});

describe('createNotification - actionUrl', () => {
  beforeEach(() => jest.clearAllMocks());

  it('persiste actionUrl quando informado (com trim)', async () => {
    const repo = makeRepo();
    await createNotification({
      data: { ...baseData, actionUrl: '  /messages/abc  ' },
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: makeDispatcher(),
    });
    expect(repo.create.mock.calls[0][0].actionUrl).toBe('/messages/abc');
  });

  it('usa actionUrl null por padrão', async () => {
    const repo = makeRepo();
    await createNotification({
      data: baseData,
      sender: { _id: 'u1' },
      NotificationRepository: repo,
      NotificationDispatcher: makeDispatcher(),
    });
    expect(repo.create.mock.calls[0][0].actionUrl).toBeNull();
  });

  it('rejeita actionUrl inválido (422)', async () => {
    const r = await createNotification({
      data: { ...baseData, actionUrl: 'javascript:alert(1)' },
      sender: { _id: 'u1' },
      NotificationRepository: makeRepo(),
      NotificationDispatcher: makeDispatcher(),
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });
});