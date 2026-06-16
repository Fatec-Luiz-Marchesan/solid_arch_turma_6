async function bootstrapAdmin({ user, AdminRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const adminCount = await AdminRepository.countAdmins();
  if (adminCount > 0) {
    return {
      success: false,
      status: 403,
      errors: ['Já existe pelo menos um administrador no sistema!'],
    };
  }

  const promoted = await AdminRepository.promote(user._id);
  return { success: true, status: 200, user: promoted };
}

module.exports = { bootstrapAdmin };