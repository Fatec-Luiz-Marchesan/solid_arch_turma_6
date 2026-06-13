const { MulterUploadService } = require('../MulterUploadService')
const { IUploadService } = require('../../../domain/ports/IUploadService')

describe('MulterUploadService (adapter de upload)', () => {
  it('deve ser uma instância que cumpre o contrato IUploadService', () => {
    const service = new MulterUploadService()
    expect(service).toBeInstanceOf(IUploadService)
  })

  it('deve expor o método single retornando um middleware (função)', () => {
    const service = new MulterUploadService()
    const middleware = service.single('image')
    expect(typeof middleware).toBe('function')
  })

  it('deve expor o método array retornando um middleware (função)', () => {
    const service = new MulterUploadService()
    const middleware = service.array('images')
    expect(typeof middleware).toBe('function')
  })

  it('deve resolver a pasta "users" quando a rota base inclui users', () => {
    const service = new MulterUploadService()
    expect(service.resolveFolder('/users')).toBe('users')
  })

  it('deve resolver a pasta "pets" quando a rota base inclui pets', () => {
    const service = new MulterUploadService()
    expect(service.resolveFolder('/pets')).toBe('pets')
  })

  it('deve aceitar arquivos png', () => {
    const service = new MulterUploadService()
    expect(service.isAllowed('foto.png')).toBe(true)
  })

  it('deve aceitar arquivos jpg', () => {
    const service = new MulterUploadService()
    expect(service.isAllowed('foto.jpg')).toBe(true)
  })

  it('deve rejeitar arquivos de extensão não permitida', () => {
    const service = new MulterUploadService()
    expect(service.isAllowed('arquivo.pdf')).toBe(false)
  })
})