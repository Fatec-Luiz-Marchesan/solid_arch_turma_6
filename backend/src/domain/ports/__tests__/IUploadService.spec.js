const { IUploadService } = require('../IUploadService')

describe('IUploadService (porta de upload)', () => {
  it('single deve lançar erro se não for implementado pela subclasse', () => {
    const port = new IUploadService()
    expect(() => port.single('image')).toThrow('Método single não implementado')
  })

  it('array deve lançar erro se não for implementado pela subclasse', () => {
    const port = new IUploadService()
    expect(() => port.array('images')).toThrow('Método array não implementado')
  })
})