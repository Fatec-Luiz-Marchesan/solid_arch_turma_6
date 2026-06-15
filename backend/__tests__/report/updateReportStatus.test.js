const {
  updateReportStatus,
} = require('../../usecases/report/updateReportStatus');

const makeRepo = (report) => ({
  findById: jest.fn(async () => report),
  update: jest.fn(async (id, data) => ({ ...report, ...data })),
});

describe('updateReportStatus use case', () => {
  const user = { _id: 'u1' };
  const existing = { _id: 'r1', status: 'pending', deletedAt: null };

  it('atualiza status válido (200)', async () => {
    const repo = makeRepo(existing);
    const r = await updateReportStatus({
      id: 'r1',
      data: { status: 'resolved' },
      user,
      ReportRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.report.status).toBe('resolved');
    expect(repo.update).toHaveBeenCalledWith('r1', { status: 'resolved' });
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await updateReportStatus({
      id: 'r1',
      data: { status: 'resolved' },
      user: null,
      ReportRepository: makeRepo(existing),
    });
    expect(r.status).toBe(401);
  });

  it('falha sem id (422)', async () => {
    const r = await updateReportStatus({
      id: undefined,
      data: { status: 'resolved' },
      user,
      ReportRepository: makeRepo(existing),
    });
    expect(r.status).toBe(422);
  });

  it('rejeita status inválido (422)', async () => {
    const r = await updateReportStatus({
      id: 'r1',
      data: { status: 'archived' },
      user,
      ReportRepository: makeRepo(existing),
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando não existe', async () => {
    const r = await updateReportStatus({
      id: 'x',
      data: { status: 'resolved' },
      user,
      ReportRepository: makeRepo(null),
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando soft-deleted', async () => {
    const repo = makeRepo({ _id: 'r1', deletedAt: new Date() });
    const r = await updateReportStatus({
      id: 'r1',
      data: { status: 'resolved' },
      user,
      ReportRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});