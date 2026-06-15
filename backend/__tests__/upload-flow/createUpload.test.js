const { describe, it, expect } = require('@jest/globals');
const { createUpload } = require('../../usecases/upload/createUpload');

const makeRepo = () => ({
  create: jest.fn(async (d) => ({ _id: 'up1', ...d })),
});

const validFile = {
  originalname: 'foto.jpg',
  mimetype: 'image/jpeg',
  size: 1024 * 100,
  filename: '123.jpg',
  path: '/tmp/123.jpg',
};

describe('createUpload', () => {
  it('cria upload válido', async () => {
    const repo = makeRepo();
    const r = await createUpload({
      file: validFile,
      user: { _id: 'u1', name: 'João' },
      description: 'Foto do Rex',
      entity: null,
      UploadRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.create.mock.calls[0][0].category).toBe('image');
  });

  it('aceita entity associada', async () => {
    const repo = makeRepo();
    const r = await createUpload({
      file: validFile,
      user: { _id: 'u1' },
      entity: { type: 'Pet', _id: 'p1' },
      UploadRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.create.mock.calls[0][0].entity).toEqual({ type: 'Pet', _id: 'p1' });
  });

  it('rejeita sem arquivo', async () => {
    const r = await createUpload({
      file: null,
      user: { _id: 'u1' },
      UploadRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('rejeita sem autenticação', async () => {
    const r = await createUpload({
      file: validFile,
      user: null,
      UploadRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('cria com deletedAt null', async () => {
    const repo = makeRepo();
    await createUpload({
      file: validFile,
      user: { _id: 'u1' },
      UploadRepository: repo,
    });
    expect(repo.create.mock.calls[0][0].deletedAt).toBeNull();
  });
});