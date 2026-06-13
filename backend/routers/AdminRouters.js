const router = require('express').Router()
const AdminController = require('../src/adapters/controllers/AdminController')

router.post('/create', AdminController.create)
router.get('/', AdminController.getAll)

module.exports = router