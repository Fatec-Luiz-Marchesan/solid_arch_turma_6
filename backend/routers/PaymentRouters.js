
const router = require('express').Router()
const PaymentController = require('../src/adapters/controllers/PaymentController')

router.post('/create', PaymentController.create)
router.post('/:id/process', PaymentController.process)

module.exports = router