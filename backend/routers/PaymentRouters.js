const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const PaymentController = require('../controllers/PaymentController');
const verifyToken = require('../helpers/check-token');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', paymentLimiter, verifyToken, PaymentController.create);
router.get('/', paymentLimiter, verifyToken, PaymentController.list);
router.get('/:id', paymentLimiter, verifyToken, PaymentController.getById);
router.patch('/:id/status', paymentLimiter, verifyToken, PaymentController.updateStatus);
router.delete('/:id', paymentLimiter, verifyToken, PaymentController.delete);

module.exports = router;