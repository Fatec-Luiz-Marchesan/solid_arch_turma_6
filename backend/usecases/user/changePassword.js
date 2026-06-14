const { validatePasswordChange } = require('../../helpers/validate-user-account');

async function changePassword({ data, user, UserRepository, PasswordHasher }) {
  const validation = validatePasswordChange(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const dbUser = await UserRepository.findById(user._id);
  if (!dbUser) {
    return { success: false, status: 404, errors: ['Usuário não encontrado!'] };
  }

  const matches = await PasswordHasher.compare(data.currentPassword, dbUser.password);
  if (!matches) {
    return { success: false, status: 422, errors: ['Senha atual incorreta!'] };
  }

  const newHash = await PasswordHasher.hash(data.newPassword);
  await UserRepository.updatePassword(user._id, newHash);

  return { success: true, status: 200, message: 'Senha atualizada!' };
}

module.exports = { changePassword };