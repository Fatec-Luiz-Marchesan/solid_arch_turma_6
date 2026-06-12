const Payment = require('../models/Payment');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createPayment } = require('../usecases/payment/createPayment');
const { listPayments } = require('../usecases/payment/listPayments');
const { getPaymentById } = require('../usecases/payment/getPaymentById');
const { updatePaymentStatus } = require('../usecases/payment/updatePaymentStatus');
const { deletePayment } = require('../usecases/payment/deletePayment');

const PaymentRepository = {
  create: (data) => new Payment(data).save(),
  findByUser: (userId) =>
    Payment.find({ 'payer._id': userId }).sort('-createdAt'),
  findActiveByUser: (userId) =>
    Payment.find({ 'payer._id': userId, deletedAt: null }).sort('-createdAt'),
  findById: (id) => Payment.findById(id),
  update: (id, data) => Payment.findByIdAndUpdate(id, data, { new: true }),
  delete: (id) => Payment.findByIdAndDelete(id),
};

module.exports = class PaymentController {
  static async create(req, res) {
    const token = getToken(req);
    const payer = await getUserByToken(token);

    const result = await createPayment({
      data: req.body,
      payer,
      PaymentRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Pagamento criado!',
      data: result.payment,
    });
  }

  static async list(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await listPayments({ user, PaymentRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ payments: result.payments });
  }

  static async getById(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getPaymentById({
      id: req.params.id,
      user,
      PaymentRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ payment: result.payment });
  }

  static async updateStatus(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await updatePaymentStatus({
      id: req.params.id,
      data: req.body,
      user,
      PaymentRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Status atualizado!',
      data: result.payment,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deletePayment({
      id: req.params.id,
      user,
      PaymentRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }
};