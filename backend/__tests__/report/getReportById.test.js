const { getReportById } = require('../../usecases/report/getReportById');

const makeRepo = (report) => ({
  findById: jest.fn(async () => report),
});

describe('getReportById use case', () => {
  const user = { _id: 'u1' };

  it('retorna denúncia existente (200)', async () => {
    const repo = makeRepo({ _id: 'r1', deletedAt: null });
    const r = await getReportById({ id: 'r1', user, ReportRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.report._id).toBe('r1');
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await getReportById({
      id: 'r1',
      user: null,
      ReportRepository: makeRepo({}),
    });
    expect(r.status).toBe(401);
  });

  it('falha sem id (422)', async () => {
    const r = await getReportById({
      id: undefined,
      user,
      ReportRepository: makeRepo({}),
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando não existe', async () => {
    const r = await getReportById({
      id: 'x',
      user,
      ReportRepository: makeRepo(null),
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando soft-deleted', async () => {
    const repo = makeRepo({ _id: 'r1', deletedAt: new Date() });
    const r = await getReportById({ id: 'r1', user, ReportRepository: repo });
    expect(r.status).toBe(404);
  });
});