const { validateSearchQuery } = require('../../helpers/validate-user-account');

async function searchUsers({ query, user, UserRepository }) {
  const validation = validateSearchQuery(query);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const results = await UserRepository.searchByNameOrEmail(query.trim(), user._id);
  return { success: true, status: 200, users: results };
}

module.exports = { searchUsers };