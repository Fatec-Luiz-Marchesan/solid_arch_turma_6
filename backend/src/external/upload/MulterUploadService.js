// backend/src/external/upload/MulterUploadService.js
const multer = require('multer')
const path = require('path')
const { IUploadService } = require('../../domain/ports/IUploadService')

// Adapter concreto: implementa a porta IUploadService usando multer.
// Se um dia trocarmos multer por outra lib, só este arquivo muda.
class MulterUploadService extends IUploadService {
  constructor() {
    super()
    this.upload = multer({
      storage: this._buildStorage(),
      fileFilter: (req, file, cb) => {
        if (!this.isAllowed(file.originalname)) {
          return cb(new Error('Por favor, envie apenas png ou jpg!'))
        }
        cb(undefined, true)
      },
    })
  }

  // Regra de pasta extraída para método testável (sem depender do multer)
  resolveFolder(baseUrl = '') {
    if (baseUrl.includes('users')) return 'users'
    if (baseUrl.includes('pets')) return 'pets'
    return ''
  }

  // Regra de extensão extraída para método testável
  isAllowed(originalname = '') {
    return /\.(png|jpg)$/.test(originalname)
  }

  _buildStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const folder = this.resolveFolder(req.baseUrl)
        cb(null, `public/images/${folder}/`)
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
      },
    })
  }

  single(fieldName) {
    return this.upload.single(fieldName)
  }

  array(fieldName) {
    return this.upload.array(fieldName)
  }
}

module.exports = { MulterUploadService }