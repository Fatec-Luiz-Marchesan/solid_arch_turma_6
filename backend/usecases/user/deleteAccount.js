const { validateDeleteAccount } = require('../../helpers/validate-user-account');

async function deleteAccount({ data, user, UserRepository, PasswordHasher }) {
  const validation = validateDeleteAccount(data);
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

  const matches = await PasswordHasher.compare(data.password, dbUser.password);
  if (!matches) {
    return { success: false, status: 422, errors: ['Senha incorreta!'] };
  }

  await UserRepository.delete(user._id);
  return { success: true, status: 200, message: 'Conta excluída!' };
}

module.exports = { deleteAccount };