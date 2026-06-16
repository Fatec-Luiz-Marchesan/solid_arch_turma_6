const { validateAdminAction } = require('../../helpers/validate-admin-action');

async function promoteUser({ targetId, AdminRepository }) {
  const validation = validateAdminAction({ targetId });
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const target = await AdminRepository.findById(targetId);
  if (!target) {
    return { success: false, status: 404, errors: ['Usuário não encontrado!'] };
  }

  if (target.role === 'admin') {
    return {
      success: false,
      status: 422,
      errors: ['O usuário já é administrador!'],
    };
  }

  const updated = await AdminRepository.promote(targetId);
  return { success: true, status: 200, user: updated };
}

module.exports = { promoteUser };