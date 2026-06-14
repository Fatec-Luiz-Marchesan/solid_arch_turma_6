const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const SettingsController = require('../controllers/SettingsController');
const verifyToken = require('../helpers/check-token');

const settingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', settingsLimiter, verifyToken, SettingsController.create);
router.get('/', settingsLimiter, verifyToken, SettingsController.get);
router.patch('/', settingsLimiter, verifyToken, SettingsController.update);
router.delete('/', settingsLimiter, verifyToken, SettingsController.delete);

module.exports = router;