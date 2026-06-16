const { validateAdminAction } = require('../../helpers/validate-admin-action');

async function demoteUser({ targetId, actor, AdminRepository }) {
  const validation = validateAdminAction({ targetId });
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const target = await AdminRepository.findById(targetId);
  if (!target) {
    return { success: false, status: 404, errors: ['Usuário não encontrado!'] };
  }

  if (target.role !== 'admin') {
    return {
      success: false,
      status: 422,
      errors: ['O usuário não é administrador!'],
    };
  }

  const adminCount = await AdminRepository.countAdmins();
  if (adminCount <= 1) {
    return {
      success: false,
      status: 422,
      errors: ['Não é possível rebaixar o último administrador do sistema!'],
    };
  }

  const updated = await AdminRepository.demote(targetId);
  return { success: true, status: 200, user: updated };
}

module.exports = { demoteUser };