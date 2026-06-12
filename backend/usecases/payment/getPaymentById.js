async function getPaymentById({ id, user, PaymentRepository }) {
  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const payment = await PaymentRepository.findById(id);
  if (!payment || payment.deletedAt) {
    return { success: false, status: 404, errors: ['Pagamento não encontrado!'] };
  }

  if (String(payment.payer._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  return { success: true, status: 200, payment };
}

module.exports = { getPaymentById };