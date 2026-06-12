
const router = require('express').Router()
const PaymentController = require('../src/adapters/controllers/PaymentController')

router.post('/create', PaymentController.create)

module.exports = router