const { validatePayment } = require('../../helpers/validate-payment');

async function createPayment({ data, payer, PaymentRepository }) {
  const validation = validatePayment(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (!payer || !payer._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const payment = await PaymentRepository.create({
    amount: data.amount,
    currency: data.currency ? String(data.currency).toUpperCase() : 'BRL',
    method: data.method,
    status: 'pending',
    transactionId: data.transactionId || undefined,
    processedAt: null,
    payer: { _id: payer._id, name: payer.name },
    pet: { _id: data.petId },
    description: data.description ? data.description.trim() : '',
  });

  return { success: true, status: 201, payment };
}

module.exports = { createPayment };