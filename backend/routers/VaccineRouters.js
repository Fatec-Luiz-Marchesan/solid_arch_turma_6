const router = require('express').Router()
const rateLimit = require('express-rate-limit')
const VaccineController = require('../controllers/VaccineController')
const verifyToken = require('../helpers/check-token')

const vaccineLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/', vaccineLimiter, verifyToken, VaccineController.create)
router.get('/', vaccineLimiter, verifyToken, VaccineController.list)
router.get('/:id', vaccineLimiter, verifyToken, VaccineController.getById)
router.patch('/:id', vaccineLimiter, verifyToken, VaccineController.update)
router.delete('/:id', vaccineLimiter, verifyToken, VaccineController.delete)

module.exports = router
