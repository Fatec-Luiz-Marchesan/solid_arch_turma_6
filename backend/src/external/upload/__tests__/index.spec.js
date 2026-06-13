const { uploadService } = require('../index')
const { IUploadService } = require('../../../domain/ports/IUploadService')

describe('upload composition root', () => {
  it('deve exportar uma instância que cumpre o contrato IUploadService', () => {
    expect(uploadService).toBeInstanceOf(IUploadService)
  })
})