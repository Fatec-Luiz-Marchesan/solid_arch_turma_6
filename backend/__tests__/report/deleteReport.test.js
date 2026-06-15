const { deleteReport } = require('../../usecases/report/deleteReport');

const makeRepo = (report) => ({
  findById: jest.fn(async () => report),
  update: jest.fn(async (id, data) => ({ ...report, ...data })),
});

describe('deleteReport use case', () => {
  const user = { _id: 'u1' };
  const existing = { _id: 'r1', deletedAt: null };

  it('faz soft delete (200)', async () => {
    const repo = makeRepo(existing);
    const r = await deleteReport({ id: 'r1', user, ReportRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(repo.update).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ deletedAt: expect.any(Date) })
    );
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await deleteReport({
      id: 'r1',
      user: null,
      ReportRepository: makeRepo(existing),
    });
    expect(r.status).toBe(401);
  });

  it('falha sem id (422)', async () => {
    const r = await deleteReport({
      id: undefined,
      user,
      ReportRepository: makeRepo(existing),
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando não existe', async () => {
    const r = await deleteReport({
      id: 'x',
      user,
      ReportRepository: makeRepo(null),
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando já soft-deleted', async () => {
    const repo = makeRepo({ _id: 'r1', deletedAt: new Date() });
    const r = await deleteReport({ id: 'r1', user, ReportRepository: repo });
    expect(r.status).toBe(404);
    expect(repo.update).not.toHaveBeenCalled();
  });
});