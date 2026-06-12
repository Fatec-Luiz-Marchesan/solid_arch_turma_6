const router = require('express').Router()
const UserController = require('../src/adapters/controllers/UserController')

router.post('/register', UserController.register)

module.exports = router