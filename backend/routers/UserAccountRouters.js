const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const UserAccountController = require('../controllers/UserAccountController');
const verifyToken = require('../helpers/check-token');

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter mais restritivo para operações sensíveis
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Muitas tentativas. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.patch('/account/change-password', sensitiveLimiter, verifyToken, UserAccountController.changePassword);
router.delete('/account', sensitiveLimiter, verifyToken, UserAccountController.deleteAccount);
router.get('/search', userLimiter, verifyToken, UserAccountController.search);

module.exports = router;