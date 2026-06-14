const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const NotificationController = require('../controllers/NotificationController');
const verifyToken = require('../helpers/check-token');

const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', notificationLimiter, verifyToken, NotificationController.create);
router.get('/', notificationLimiter, verifyToken, NotificationController.list);
router.get('/unread-count', notificationLimiter, verifyToken, NotificationController.countUnread);
router.patch('/mark-all-read', notificationLimiter, verifyToken, NotificationController.markAllAsRead);
router.get('/:id', notificationLimiter, verifyToken, NotificationController.getById);
router.patch('/:id/read', notificationLimiter, verifyToken, NotificationController.markAsRead);
router.patch('/:id/archive', notificationLimiter, verifyToken, NotificationController.archive);
router.delete('/:id', notificationLimiter, verifyToken, NotificationController.delete);

module.exports = router;