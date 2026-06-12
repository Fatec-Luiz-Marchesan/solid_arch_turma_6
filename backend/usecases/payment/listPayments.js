async function listPayments({ user, PaymentRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const payments = await PaymentRepository.findActiveByUser(user._id);
  return { success: true, status: 200, payments };
}

module.exports = { listPayments };