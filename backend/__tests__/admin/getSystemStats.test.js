const { describe, it, expect } = require('@jest/globals');
const { getSystemStats } = require('../../usecases/admin/getSystemStats');

describe('getSystemStats use case', () => {
  it('retorna estatísticas agregadas', async () => {
    const repo = {
      countUsers: jest.fn(async () => 10),
      countAdmins: jest.fn(async () => 2),
      countPets: jest.fn(async () => 25),
      countMessages: jest.fn(async () => 100),
    };
    const r = await getSystemStats({ AdminRepository: repo });
    expect(r.success).toBe(true);
    expect(r.stats.totalUsers).toBe(10);
    expect(r.stats.totalAdmins).toBe(2);
    expect(r.stats.totalPets).toBe(25);
    expect(r.stats.totalMessages).toBe(100);
  });
});