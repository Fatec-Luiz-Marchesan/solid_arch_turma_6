const { describe, it, expect } = require('@jest/globals');
const { createMessage } = require('../../usecases/message/createMessage');

const makeRepo = () => ({
  create: jest.fn(async (d) => ({ _id: 'msg1', ...d })),
});

describe('createMessage use case', () => {
  it('cria mensagem com dados válidos', async () => {
    const repo = makeRepo();
    const r = await createMessage({
      data: { content: 'Oi', receiverId: 'u2', petId: 'p1' },
      sender: { _id: 'u1', name: 'João' },
      MessageRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    expect(repo.create).toHaveBeenCalled();
  });

  it('falha com dados inválidos', async () => {
    const r = await createMessage({
      data: { content: '' },
      sender: { _id: 'u1' },
      MessageRepository: makeRepo(),
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });

  it('falha sem sender autenticado', async () => {
    const r = await createMessage({
      data: { content: 'Oi', receiverId: 'u2', petId: 'p1' },
      sender: null,
      MessageRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('falha ao enviar mensagem para si mesmo', async () => {
    const r = await createMessage({
      data: { content: 'Oi', receiverId: 'u1', petId: 'p1' },
      sender: { _id: 'u1' },
      MessageRepository: makeRepo(),
    });
    expect(r.success).toBe(false);
    expect(r.errors[0]).toMatch(/si mesmo/);
  });
});