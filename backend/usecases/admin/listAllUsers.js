async function listAllUsers({ AdminRepository }) {
  const users = await AdminRepository.findAll();
  return { success: true, status: 200, users };
}

module.exports = { listAllUsers };