const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const LocationController = require('../controllers/LocationController');
const verifyToken = require('../helpers/check-token');

const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', locationLimiter, verifyToken, LocationController.create);
router.get('/', locationLimiter, verifyToken, LocationController.list);
router.get('/:id', locationLimiter, verifyToken, LocationController.getById);
router.patch('/:id/primary', locationLimiter, verifyToken, LocationController.setPrimary);
router.patch('/:id', locationLimiter, verifyToken, LocationController.update);
router.delete('/:id', locationLimiter, verifyToken, LocationController.delete);

module.exports = router;