class IUploadService {
  // Retorna um middleware para upload de UM arquivo no campo informado
  single(fieldName) {
    throw new Error('Método single não implementado')
  }

  // Retorna um middleware para upload de VÁRIOS arquivos no campo informado
  array(fieldName) {
    throw new Error('Método array não implementado')
  }
}

module.exports = { IUploadService }