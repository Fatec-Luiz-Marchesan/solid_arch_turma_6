const router = require('express').Router();
const MessageController = require('../controllers/MessageController');
const verifyToken = require('../helpers/check-token');

router.post('/', verifyToken, MessageController.create);
router.get('/', verifyToken, MessageController.list);
router.get('/:id', verifyToken, MessageController.getById);
router.patch('/:id', verifyToken, MessageController.update);
router.delete('/:id', verifyToken, MessageController.delete);

module.exports = router;