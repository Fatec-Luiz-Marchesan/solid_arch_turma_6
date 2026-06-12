const router = require('express').Router()
const LocationController = require('../src/adapters/controllers/LocationController')

router.post('/create', LocationController.create)
router.get('/nearby', LocationController.nearby)

module.exports = router