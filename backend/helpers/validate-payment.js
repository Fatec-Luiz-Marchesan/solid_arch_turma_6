const ALLOWED_METHODS = ['credit_card', 'debit_card', 'pix', 'cash'];
const ALLOWED_STATUS = ['pending', 'completed', 'refunded'];
const ALLOWED_CURRENCIES = ['BRL', 'USD', 'EUR'];
const MAX_AMOUNT = 1000000;
const TRANSACTION_ID_REGEX = /^[A-Za-z0-9-]{8,50}$/;
const MAX_INSTALLMENTS = 12;

function validatePayment(data) {
  const errors = [];

  if (data.amount === undefined || data.amount === null) {
    errors.push('O valor é obrigatório!');
  } else if (typeof data.amount !== 'number' || isNaN(data.amount)) {
    errors.push('O valor deve ser um número!');
  } else if (data.amount <= 0) {
    errors.push('O valor deve ser maior que zero!');
  } else if (data.amount > MAX_AMOUNT) {
    errors.push(`O valor não pode ser maior que ${MAX_AMOUNT}!`);
  }

  if (!data.method) {
    errors.push('O método de pagamento é obrigatório!');
  } else if (!ALLOWED_METHODS.includes(data.method)) {
    errors.push('Método de pagamento inválido!');
  }

  if (!data.petId) {
    errors.push('O pet é obrigatório!');
  }

  if (data.description && data.description.length > 500) {
    errors.push('A descrição não pode passar de 500 caracteres!');
  }

  if (data.currency && !ALLOWED_CURRENCIES.includes(String(data.currency).toUpperCase())) {
    errors.push('Moeda inválida!');
  }

  if (data.transactionId && !TRANSACTION_ID_REGEX.test(data.transactionId)) {
    errors.push('transactionId deve ser alfanumérico entre 8 e 50 caracteres!');
  }

  if (data.installments !== undefined) {
    if (!Number.isInteger(data.installments)) {
      errors.push('installments deve ser um número inteiro!');
    } else if (data.installments < 1 || data.installments > MAX_INSTALLMENTS) {
      errors.push(`installments deve estar entre 1 e ${MAX_INSTALLMENTS}!`);
    } else if (data.installments > 1 && data.method !== 'credit_card') {
      errors.push('Parcelamento permitido apenas para credit_card!');
    }
  }

  if (data.fee !== undefined) {
    if (typeof data.fee !== 'number' || isNaN(data.fee)) {
      errors.push('fee deve ser um número!');
    } else if (data.fee < 0) {
      errors.push('fee não pode ser negativa!');
    } else if (data.amount && data.fee > data.amount) {
      errors.push('fee não pode ser maior que o valor!');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateStatus(status) {
  if (!status) {
    return { isValid: false, errors: ['Status é obrigatório!'] };
  }
  if (!ALLOWED_STATUS.includes(status)) {
    return { isValid: false, errors: ['Status inválido!'] };
  }
  return { isValid: true, errors: [] };
}

function validateRefund(data) {
  const errors = [];
  if (!data.refundReason || typeof data.refundReason !== 'string') {
    errors.push('refundReason é obrigatório para estornar!');
  } else if (data.refundReason.trim().length < 5) {
    errors.push('refundReason deve ter pelo menos 5 caracteres!');
  } else if (data.refundReason.length > 500) {
    errors.push('refundReason não pode passar de 500 caracteres!');
  }
  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validatePayment,
  validateStatus,
  validateRefund,
  ALLOWED_METHODS,
  ALLOWED_STATUS,
  ALLOWED_CURRENCIES,
  MAX_AMOUNT,
  MAX_INSTALLMENTS,
};