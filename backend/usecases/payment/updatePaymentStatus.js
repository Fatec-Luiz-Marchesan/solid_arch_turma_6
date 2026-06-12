const { validateStatus, validateRefund } = require('../../helpers/validate-payment');

async function updatePaymentStatus({ id, data, user, PaymentRepository }) {
  const payment = await PaymentRepository.findById(id);
  if (!payment || payment.deletedAt) {
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

  const updatePayload = { status: data.status };

  if (data.status === 'completed' || data.status === 'refunded') {
    updatePayload.processedAt = new Date();
  }

  if (data.status === 'refunded') {
    const refundValidation = validateRefund(data);
    if (!refundValidation.isValid) {
      return { success: false, status: 422, errors: refundValidation.errors };
    }
    updatePayload.refundReason = data.refundReason.trim();
  }

  const updated = await PaymentRepository.update(id, updatePayload);
  return { success: true, status: 200, payment: updated };
}

module.exports = { updatePaymentStatus };