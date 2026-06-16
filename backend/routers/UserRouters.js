const router = require('express').Router()
const rateLimit = require('express-rate-limit')

const UserController = require('../controllers/UserController')

const verifyToken = require('../helpers/check-token')
const { imageUpload } = require('../helpers/image-upload')

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Muitas tentativas. Aguarde 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
})

const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
})

router.post('/register', authLimiter, UserController.register)
router.post('/login', authLimiter, UserController.login)
router.get('/checkuser', userLimiter, UserController.checkUser)
router.get('/:id', userLimiter, UserController.getUserById)
router.patch('/edit/:id',
    userLimiter,
    verifyToken,
    imageUpload.single('image'),
    UserController.editUser)

module.exports = router