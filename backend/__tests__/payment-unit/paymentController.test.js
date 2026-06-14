const { describe, it, expect, beforeEach } = require('@jest/globals');

jest.mock('../../helpers/get-token', () => () => 'fake-token');
jest.mock('../../helpers/get-user-by-token', () => jest.fn());

jest.mock('../../usecases/payment/createPayment', () => ({
  createPayment: jest.fn(),
}));
jest.mock('../../usecases/payment/listPayments', () => ({
  listPayments: jest.fn(),
}));
jest.mock('../../usecases/payment/getPaymentById', () => ({
  getPaymentById: jest.fn(),
}));
jest.mock('../../usecases/payment/updatePaymentStatus', () => ({
  updatePaymentStatus: jest.fn(),
}));
jest.mock('../../usecases/payment/deletePayment', () => ({
  deletePayment: jest.fn(),
}));

const getUserByToken = require('../../helpers/get-user-by-token');
const { createPayment } = require('../../usecases/payment/createPayment');
const { listPayments } = require('../../usecases/payment/listPayments');
const { getPaymentById } = require('../../usecases/payment/getPaymentById');
const { updatePaymentStatus } = require('../../usecases/payment/updatePaymentStatus');
const { deletePayment } = require('../../usecases/payment/deletePayment');
const PaymentController = require('../../controllers/PaymentController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('PaymentController — testes de unidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserByToken.mockResolvedValue({ _id: 'u1', name: 'João' });
  });

  describe('create', () => {
    it('retorna 201 quando use case retorna sucesso', async () => {
      createPayment.mockResolvedValueOnce({
        success: true,
        status: 201,
        payment: { _id: 'p1' },
      });
      const req = { body: { amount: 50, method: 'pix', petId: 'p1' } };
      const res = makeRes();

      await PaymentController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });

    it('retorna status de erro quando use case falha', async () => {
      createPayment.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Valor inválido!'],
      });
      const req = { body: {} };
      const res = makeRes();

      await PaymentController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: 'Valor inválido!' });
    });

    it('passa body, payer e repository para o use case', async () => {
      createPayment.mockResolvedValueOnce({ success: true, status: 201, payment: {} });
      const req = { body: { amount: 100 } };
      await PaymentController.create(req, makeRes());

      const args = createPayment.mock.calls[0][0];
      expect(args.data).toEqual({ amount: 100 });
      expect(args.payer).toEqual({ _id: 'u1', name: 'João' });
      expect(args.PaymentRepository).toBeDefined();
    });
  });

  describe('list', () => {
    it('retorna 200 com lista de pagamentos', async () => {
      listPayments.mockResolvedValueOnce({
        success: true,
        status: 200,
        payments: [{ _id: 'p1' }],
      });
      const res = makeRes();

      await PaymentController.list({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ payments: [{ _id: 'p1' }] });
    });

    it('retorna erro quando use case falha', async () => {
      listPayments.mockResolvedValueOnce({
        success: false,
        status: 401,
        errors: ['Não autenticado!'],
      });
      const res = makeRes();

      await PaymentController.list({}, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getById', () => {
    it('retorna 200 com o pagamento', async () => {
      getPaymentById.mockResolvedValueOnce({
        success: true,
        status: 200,
        payment: { _id: 'p1' },
      });
      const req = { params: { id: 'p1' } };
      const res = makeRes();

      await PaymentController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ payment: { _id: 'p1' } });
    });

    it('retorna 404 quando não encontrado', async () => {
      getPaymentById.mockResolvedValueOnce({
        success: false,
        status: 404,
        errors: ['Pagamento não encontrado!'],
      });
      const req = { params: { id: 'xx' } };
      const res = makeRes();

      await PaymentController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateStatus', () => {
    it('retorna 200 quando status atualizado', async () => {
      updatePaymentStatus.mockResolvedValueOnce({
        success: true,
        status: 200,
        payment: { _id: 'p1', status: 'completed' },
      });
      const req = { params: { id: 'p1' }, body: { status: 'completed' } };
      const res = makeRes();

      await PaymentController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 422 com status inválido', async () => {
      updatePaymentStatus.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Status inválido!'],
      });
      const req = { params: { id: 'p1' }, body: { status: 'xx' } };
      const res = makeRes();

      await PaymentController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('delete', () => {
    it('retorna 200 quando deletado', async () => {
      deletePayment.mockResolvedValueOnce({
        success: true,
        status: 200,
        message: 'Pagamento removido!',
      });
      const req = { params: { id: 'p1' } };
      const res = makeRes();

      await PaymentController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Pagamento removido!' });
    });

    it('retorna 403 quando não autorizado', async () => {
      deletePayment.mockResolvedValueOnce({
        success: false,
        status: 403,
        errors: ['Acesso negado!'],
      });
      const req = { params: { id: 'p1' } };
      const res = makeRes();

      await PaymentController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});