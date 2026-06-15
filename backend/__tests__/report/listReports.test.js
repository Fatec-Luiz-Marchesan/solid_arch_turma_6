const { listReports } = require('../../usecases/report/listReports');

const makeRepo = (items = []) => ({
  findActive: jest.fn(async (query = {}) =>
    items.filter(
      (i) =>
        (!query.status || i.status === query.status) &&
        (!query.targetType || i.targetType === query.targetType)
    )
  ),
});

describe('listReports use case', () => {
  const user = { _id: 'u1' };

  it('lista denúncias ativas (200)', async () => {
    const repo = makeRepo([{ _id: 'r1', status: 'pending', targetType: 'pet' }]);
    const r = await listReports({ user, ReportRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.reports).toHaveLength(1);
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await listReports({ user: null, ReportRepository: makeRepo() });
    expect(r.status).toBe(401);
  });

  it('filtra por status', async () => {
    const repo = makeRepo([
      { _id: 'r1', status: 'pending' },
      { _id: 'r2', status: 'resolved' },
    ]);
    const r = await listReports({
      user,
      ReportRepository: repo,
      filters: { status: 'resolved' },
    });
    expect(r.reports).toHaveLength(1);
    expect(r.reports[0].status).toBe('resolved');
  });

  it('filtra por targetType', async () => {
    const repo = makeRepo([
      { _id: 'r1', targetType: 'pet' },
      { _id: 'r2', targetType: 'user' },
    ]);
    const r = await listReports({
      user,
      ReportRepository: repo,
      filters: { targetType: 'user' },
    });
    expect(r.reports).toHaveLength(1);
    expect(r.reports[0].targetType).toBe('user');
  });

  it('rejeita filtro de status inválido (422)', async () => {
    const r = await listReports({
      user,
      ReportRepository: makeRepo(),
      filters: { status: 'archived' },
    });
    expect(r.status).toBe(422);
  });

  it('rejeita filtro de targetType inválido (422)', async () => {
    const r = await listReports({
      user,
      ReportRepository: makeRepo(),
      filters: { targetType: 'comment' },
    });
    expect(r.status).toBe(422);
  });

  it('retorna lista vazia quando não há denúncias', async () => {
    const r = await listReports({ user, ReportRepository: makeRepo([]) });
    expect(r.reports).toEqual([]);
  });
});