const { CreateAdmin } = require('../CreateAdmin')

describe('CreateAdmin Use Case', () => {
  
  const makeAdminRepository = () => ({
    findByEmail: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(async (admin) => ({
      id: 'generated-id',
      name: admin.name,
      email: admin.email,
      password: admin.password,
      role: admin.role,
    })),
  })

  
  const makeHasher = () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
  })

  const makeSut = () => {
    const adminRepository = makeAdminRepository()
    const hasher = makeHasher()
    const sut = new CreateAdmin(adminRepository, hasher)
    return { sut, adminRepository, hasher }
  }

  const validInput = {
    name: 'Root Admin',
    email: 'root@admin.com',
    password: '123456',
  }

  it('deve lançar erro se o email não for informado', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, email: undefined }))
      .rejects.toThrow('O email é obrigatório!')
  })

  it('deve lançar erro se a senha tiver menos de 6 caracteres', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, password: '123' }))
      .rejects.toThrow('A senha deve ter no mínimo 6 caracteres!')
  })

  it('deve lançar erro se o admin já existir (email duplicado)', async () => {
    const { sut, adminRepository } = makeSut()
    adminRepository.findByEmail.mockResolvedValue({ id: 'existing', email: 'root@admin.com' })

    await expect(sut.execute(validInput))
      .rejects.toThrow('Já existe um admin com este email!')
  })

  it('deve criptografar a senha antes de salvar', async () => {
    const { sut, hasher, adminRepository } = makeSut()
    await sut.execute(validInput)

    expect(hasher.hash).toHaveBeenCalledWith('123456')
    expect(adminRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed-password' })
    )
  })

  it('deve criar o admin e NUNCA retornar a senha no resultado', async () => {
    const { sut } = makeSut()
    const result = await sut.execute(validInput)

    expect(result).toHaveProperty('id')
    expect(result.email).toBe('root@admin.com')
    expect(result.password).toBeUndefined()
  })

  it('deve atribuir a role "admin" por padrão', async () => {
    const { sut, adminRepository } = makeSut()
    await sut.execute(validInput)

    expect(adminRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' })
    )
  })
})