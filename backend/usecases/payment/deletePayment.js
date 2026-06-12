async function deletePayment({ id, user, PaymentRepository }) {
  const payment = await PaymentRepository.findById(id);
  if (!payment || payment.deletedAt) {
    return { success: false, status: 404, errors: ['Pagamento não encontrado!'] };
  }

  if (String(payment.payer._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  if (payment.status !== 'pending') {
    return {
      success: false,
      status: 422,
      errors: ['Apenas pagamentos pendentes podem ser deletados!'],
    };
  }

  await PaymentRepository.update(id, { deletedAt: new Date() });
  return { success: true, status: 200, message: 'Pagamento removido!' };
}

module.exports = { deletePayment };