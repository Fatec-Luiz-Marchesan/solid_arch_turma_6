const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ReportController = require('../controllers/ReportController');
const verifyToken = require('../helpers/check-token');

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Todas as rotas exigem autenticação (denúncias são dados sensíveis)
router.post('/', reportLimiter, verifyToken, ReportController.create);
router.get('/', reportLimiter, verifyToken, ReportController.list);
router.get('/:id', reportLimiter, verifyToken, ReportController.getById);
router.patch(
  '/:id/status',
  reportLimiter,
  verifyToken,
  ReportController.updateStatus
);
router.delete('/:id', reportLimiter, verifyToken, ReportController.delete);

module.exports = router;