const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const BreedController = require('../controllers/BreedController');
const verifyToken = require('../helpers/check-token');

const breedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public reads (catalog), authenticated writes
router.get('/', breedLimiter, BreedController.list);
router.get('/:id', breedLimiter, BreedController.getById);

router.post('/', breedLimiter, verifyToken, BreedController.create);
router.patch('/:id', breedLimiter, verifyToken, BreedController.update);
router.delete('/:id', breedLimiter, verifyToken, BreedController.delete);

module.exports = router;