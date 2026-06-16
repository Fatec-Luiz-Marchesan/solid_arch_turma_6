const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const AdminController = require('../controllers/AdminController');
const verifyToken = require('../helpers/check-token');
const checkAdmin = require('../helpers/check-admin');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/bootstrap', adminLimiter, verifyToken, AdminController.bootstrap);

router.get('/users', adminLimiter, checkAdmin, AdminController.listUsers);
router.get('/users/:id', adminLimiter, checkAdmin, AdminController.getUser);
router.patch('/users/:id/promote', adminLimiter, checkAdmin, AdminController.promote);
router.patch('/users/:id/demote', adminLimiter, checkAdmin, AdminController.demote);
router.delete('/users/:id', adminLimiter, checkAdmin, AdminController.deleteUser);
router.get('/stats', adminLimiter, checkAdmin, AdminController.stats);

module.exports = router;