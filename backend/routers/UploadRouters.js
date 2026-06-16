const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const UploadController = require('../controllers/UploadController');
const verifyToken = require('../helpers/check-token');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Muitas requisições de upload. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|pdf)$/i)) {
      return cb(new Error('Formato não permitido! Aceitos: png, jpg, pdf'));
    }
    cb(null, true);
  },
});

router.post('/', uploadLimiter, verifyToken, upload.single('file'), UploadController.create);
router.get('/', uploadLimiter, verifyToken, UploadController.list);
router.get('/entity/:entityType/:entityId', uploadLimiter, verifyToken, UploadController.getByEntity);
router.get('/:id', uploadLimiter, verifyToken, UploadController.getById);
router.patch('/:id', uploadLimiter, verifyToken, UploadController.update);
router.delete('/:id', uploadLimiter, verifyToken, UploadController.delete);

module.exports = router;