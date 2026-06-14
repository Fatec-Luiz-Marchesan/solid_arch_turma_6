const express = require('express');


function buildTestApp({ paymentRepository, currentUser }) {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    if (currentUser) {
      req.testUser = currentUser;
    }
    next();
  });

  const PaymentController = require('../../controllers/PaymentController');
  PaymentController.setRepository(paymentRepository);

  const router = express.Router();
  router.post('/', PaymentController.create);
  router.get('/', PaymentController.list);
  router.get('/:id', PaymentController.getById);
  router.patch('/:id/status', PaymentController.updateStatus);
  router.delete('/:id', PaymentController.delete);

  app.use('/payments', router);
  return app;
}

module.exports = { buildTestApp };