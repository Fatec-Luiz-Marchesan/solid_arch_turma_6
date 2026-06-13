
const router = require('express').Router()
const DietController = require('../src/adapters/controllers/DietController')

router.post('/create', DietController.create)

module.exports = router