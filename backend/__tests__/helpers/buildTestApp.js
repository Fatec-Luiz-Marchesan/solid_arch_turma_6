const express = require('express');

function buildTestApp({ paymentRepository, breedRepository, reportRepository, currentUser } = {}) {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    if (currentUser) {
      req.testUser = currentUser;
    }
    next();
  });

  if (paymentRepository) {
    const PaymentController = require('../../controllers/PaymentController');
    PaymentController.setRepository(paymentRepository);

    const router = express.Router();
    router.post('/', PaymentController.create);
    router.get('/', PaymentController.list);
    router.get('/:id', PaymentController.getById);
    router.patch('/:id/status', PaymentController.updateStatus);
    router.delete('/:id', PaymentController.delete);

    app.use('/payments', router);
  }

  if (breedRepository) {
    const BreedController = require('../../controllers/BreedController');
    BreedController.setRepository(breedRepository);

    const router = express.Router();
    router.post('/', BreedController.create);
    router.get('/', BreedController.list);
    router.get('/:id', BreedController.getById);
    router.patch('/:id', BreedController.update);
    router.delete('/:id', BreedController.delete);

    app.use('/breeds', router);
  }

  if (reportRepository) {
    const ReportController = require('../../controllers/ReportController');
    ReportController.setRepository(reportRepository);

    const router = express.Router();
    router.post('/', ReportController.create);
    router.get('/', ReportController.list);
    router.get('/:id', ReportController.getById);
    router.patch('/:id/status', ReportController.updateStatus);
    router.delete('/:id', ReportController.delete);

    app.use('/reports', router);
  }

  return app;
}

module.exports = { buildTestApp };