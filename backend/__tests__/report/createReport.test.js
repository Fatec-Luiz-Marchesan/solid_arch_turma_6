const { createReport } = require('../../usecases/report/createReport');

const makeRepo = (duplicate = null) => ({
  findDuplicate: jest.fn(async () => duplicate),
  create: jest.fn(async (d) => ({ _id: 'rep1', ...d })),
});

const validData = {
  targetType: 'pet',
  targetId: 'pet-123',
  reason: 'spam',
};

describe('createReport use case', () => {
  it('cria denúncia válida (201) com defaults', async () => {
    const repo = makeRepo();
    const r = await createReport({
      data: validData,
      user: { _id: 'u1', name: 'João' },
      ReportRepository: repo,
    });

    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    const payload = repo.create.mock.calls[0][0];
    expect(payload.reporter).toEqual({ _id: 'u1', name: 'João' });
    expect(payload.status).toBe('pending');
    expect(payload.severity).toBe('low');
    expect(payload.description).toBe('');
    expect(payload.moderatorNote).toBe('');
    expect(payload.deletedAt).toBeNull();
  });

  it('aceita severity customizada', async () => {
    const repo = makeRepo();
    await createReport({
      data: { ...validData, severity: 'high' },
      user: { _id: 'u1' },
      ReportRepository: repo,
    });
    const payload = repo.create.mock.calls[0][0];
    expect(payload.severity).toBe('high');
  });

  it('falha com severity inválida (422)', async () => {
    const r = await createReport({
      data: { ...validData, severity: 'critical' },
      user: { _id: 'u1' },
      ReportRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
    expect(r.success).toBe(false);
  });

  it('normaliza targetId e description', async () => {
    const repo = makeRepo();
    await createReport({
      data: {
        ...validData,
        targetId: '  pet-123  ',
        description: '  texto   com   espacos  ',
      },
      user: { _id: 'u1' },
      ReportRepository: repo,
    });
    const payload = repo.create.mock.calls[0][0];
    expect(payload.targetId).toBe('pet-123');
    expect(payload.description).toBe('texto com espacos');
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await createReport({
      data: validData,
      user: null,
      ReportRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
    expect(r.success).toBe(false);
  });

  it('falha com dados inválidos (422)', async () => {
    const r = await createReport({
      data: { targetType: 'pet', targetId: 'x', reason: 'invalido' },
      user: { _id: 'u1' },
      ReportRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('falha quando o usuário já denunciou o mesmo alvo (409)', async () => {
    const repo = makeRepo({ _id: 'old', targetId: 'pet-123' });
    const r = await createReport({
      data: validData,
      user: { _id: 'u1' },
      ReportRepository: repo,
    });
    expect(r.status).toBe(409);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('passa os parâmetros corretos para findDuplicate', async () => {
    const repo = makeRepo();
    await createReport({
      data: validData,
      user: { _id: 'u1' },
      ReportRepository: repo,
    });
    expect(repo.findDuplicate).toHaveBeenCalledWith({
      reporterId: 'u1',
      targetType: 'pet',
      targetId: 'pet-123',
    });
  });
});