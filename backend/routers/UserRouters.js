const router = require('express').Router()

const UserController = require('../controllers/UserController')

const verifyToken = require('../helpers/check-token')
const { imageUpload } = require('../helpers/image-upload')
const { authLimiter } = require('../infra/security/rateLimiter')

router.post('/register', authLimiter, UserController.register)
router.post('/login', authLimiter, UserController.login)
router.get('/checkuser', UserController.checkUser)
router.get('/:id', UserController.getUserById)
router.patch('/edit/:id',
    verifyToken,
    imageUpload.single('image'),
    UserController.editUser)

module.exports = router