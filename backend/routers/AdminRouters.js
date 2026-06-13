const router = require('express').Router()
const AdminController = require('../src/adapters/controllers/AdminController')

router.post('/create', AdminController.create)

module.exports = router