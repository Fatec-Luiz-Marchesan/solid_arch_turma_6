async function getSystemStats({ AdminRepository }) {
  const [totalUsers, totalAdmins, totalPets, totalMessages] = await Promise.all([
    AdminRepository.countUsers(),
    AdminRepository.countAdmins(),
    AdminRepository.countPets(),
    AdminRepository.countMessages(),
  ]);

  return {
    success: true,
    status: 200,
    stats: { totalUsers, totalAdmins, totalPets, totalMessages },
  };
}

module.exports = { getSystemStats };