const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const DietController = require('../controllers/DietController');
const verifyToken = require('../helpers/check-token');

const dietLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public reads, authenticated writes
router.get('/', dietLimiter, DietController.list);
router.get('/:id', dietLimiter, DietController.getById);

router.post('/', dietLimiter, verifyToken, DietController.create);
router.patch('/:id', dietLimiter, verifyToken, DietController.update);
router.delete('/:id', dietLimiter, verifyToken, DietController.delete);

module.exports = router;
