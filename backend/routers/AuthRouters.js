const router = require('express').Router()
const AuthController = require('../src/adapters/controllers/AuthController')

router.post('/login', AuthController.login)

module.exports = router