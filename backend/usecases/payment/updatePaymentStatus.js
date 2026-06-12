const { validateStatus } = require('../../helpers/validate-payment');

async function updatePaymentStatus({ id, data, user, PaymentRepository }) {
  const payment = await PaymentRepository.findById(id);
  if (!payment) {
    return { success: false, status: 404, errors: ['Pagamento não encontrado!'] };
  }

  if (String(payment.payer._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  const validation = validateStatus(data.status);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (payment.status === 'refunded') {
    return {
      success: false,
      status: 422,
      errors: ['Pagamento já estornado, não pode ser alterado!'],
    };
  }

  const updated = await PaymentRepository.update(id, { status: data.status });
  return { success: true, status: 200, payment: updated };
}

module.exports = { updatePaymentStatus };