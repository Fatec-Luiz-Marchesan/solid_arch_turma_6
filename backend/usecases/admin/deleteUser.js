const { validateAdminAction } = require('../../helpers/validate-admin-action');

async function deleteUser({ targetId, actor, AdminRepository }) {
  const validation = validateAdminAction({ targetId });
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (String(actor._id) === String(targetId)) {
    return {
      success: false,
      status: 422,
      errors: ['Você não pode deletar a si mesmo!'],
    };
  }

  const target = await AdminRepository.findById(targetId);
  if (!target) {
    return { success: false, status: 404, errors: ['Usuário não encontrado!'] };
  }

  if (target.role === 'admin') {
    const adminCount = await AdminRepository.countAdmins();
    if (adminCount <= 1) {
      return {
        success: false,
        status: 422,
        errors: ['Não é possível deletar o último administrador do sistema!'],
      };
    }
  }

  await AdminRepository.delete(targetId);
  return { success: true, status: 200, message: 'Usuário removido!' };
}

module.exports = { deleteUser };