function validateLocation(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 1) {
    errors.push('O nome da localização é obrigatório!');
  }

  if (!data.street || typeof data.street !== 'string') {
    errors.push('A rua é obrigatória!');
  }

  if (!data.city || typeof data.city !== 'string') {
    errors.push('A cidade é obrigatória!');
  }

  if (!data.state || typeof data.state !== 'string' || !/^[A-Z]{2}$/.test(data.state)) {
    errors.push('O estado deve estar no formato de 2 letras maiúsculas (ex: SP)!');
  }

  if (!data.zipCode || typeof data.zipCode !== 'string' || !/^\d{5}-?\d{3}$/.test(data.zipCode)) {
    errors.push('O CEP deve estar no formato válido (ex: 01310-100)!');
  }

  if (data.latitude !== undefined && data.latitude !== null) {
    if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
      errors.push('A latitude deve estar entre -90 e 90!');
    }
  }

  if (data.longitude !== undefined && data.longitude !== null) {
    if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
      errors.push('A longitude deve estar entre -180 e 180!');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validateLocation };