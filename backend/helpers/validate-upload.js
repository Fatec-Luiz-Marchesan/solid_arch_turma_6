const ALLOWED_MIMETYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
];

const FILE_CATEGORIES = ['image', 'document'];

const MAX_SIZE_IMAGE = 5 * 1024 * 1024;
const MAX_SIZE_DOCUMENT = 10 * 1024 * 1024;

function categorizeFile(mimetype) {
  if (['image/png', 'image/jpeg'].includes(mimetype)) return 'image';
  if (mimetype === 'application/pdf') return 'document';
  return null;
}

function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push('Nenhum arquivo enviado!');
    return { isValid: false, errors };
  }

  if (!file.originalname || typeof file.originalname !== 'string') {
    errors.push('Nome do arquivo é obrigatório!');
  } else if (file.originalname.length > 255) {
    errors.push('Nome do arquivo não pode passar de 255 caracteres!');
  }

  if (!file.mimetype) {
    errors.push('Tipo do arquivo é obrigatório!');
  } else if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    errors.push('Tipo de arquivo não permitido! Aceitos: png, jpg, pdf');
  }

  const category = categorizeFile(file.mimetype);

  if (file.size !== undefined && file.size !== null) {
    if (file.size <= 0) {
      errors.push('Arquivo vazio!');
    } else if (category === 'image' && file.size > MAX_SIZE_IMAGE) {
      errors.push(`Imagem não pode passar de ${MAX_SIZE_IMAGE / (1024 * 1024)}MB!`);
    } else if (category === 'document' && file.size > MAX_SIZE_DOCUMENT) {
      errors.push(`Documento não pode passar de ${MAX_SIZE_DOCUMENT / (1024 * 1024)}MB!`);
    }
  }

  return { isValid: errors.length === 0, errors, category };
}

function validateUploadUpdate(data) {
  const errors = [];

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Descrição deve ser texto!');
    } else if (data.description.length > 500) {
      errors.push('Descrição não pode passar de 500 caracteres!');
    }
  }

  if (data.entity !== undefined) {
    if (typeof data.entity !== 'object' || data.entity === null) {
      errors.push('entity deve ser um objeto!');
    } else if (!data.entity.type || !data.entity._id) {
      errors.push('entity deve ter type e _id!');
    }
  }

  return { isValid: errors.length === 0, errors };
}

function validateListFilters(filters) {
  const errors = [];
  const sanitized = {};

  if (filters.category) {
    if (!FILE_CATEGORIES.includes(filters.category)) {
      errors.push('Filtro de categoria inválido!');
    } else {
      sanitized.category = filters.category;
    }
  }

  if (filters.entityType) {
    sanitized.entityType = filters.entityType;
  }

  if (filters.entityId) {
    sanitized.entityId = filters.entityId;
  }

  if (filters.limit !== undefined) {
    const n = parseInt(filters.limit, 10);
    if (isNaN(n) || n < 1 || n > 100) {
      errors.push('limit deve estar entre 1 e 100!');
    } else {
      sanitized.limit = n;
    }
  } else {
    sanitized.limit = 50;
  }

  return { isValid: errors.length === 0, errors, filters: sanitized };
}

module.exports = {
  validateFile,
  validateUploadUpdate,
  validateListFilters,
  categorizeFile,
  ALLOWED_MIMETYPES,
  FILE_CATEGORIES,
  MAX_SIZE_IMAGE,
  MAX_SIZE_DOCUMENT,
};