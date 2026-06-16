const { validateAdminAction } = require('../../helpers/validate-admin-action');

async function getUserDetails({ targetId, AdminRepository }) {
  const validation = validateAdminAction({ targetId });
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const user = await AdminRepository.findById(targetId);
  if (!user) {
    return { success: false, status: 404, errors: ['Usuário não encontrado!'] };
  }

  return { success: true, status: 200, user };
}

module.exports = { getUserDetails };