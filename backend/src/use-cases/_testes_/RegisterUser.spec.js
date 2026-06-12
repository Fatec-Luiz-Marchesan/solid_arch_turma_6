const { RegisterUser } = require('../RegisterUser')

describe('RegisterUser Use Case', () => {
  const makeUserRepository = () => ({
    findByEmail: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(async (user) => ({
      id: 'user-id',
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
    })),
  })

  const makeHasher = () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
  })

  const makeTokenGenerator = () => ({
    generate: jest.fn().mockReturnValue('valid-token'),
  })

  const makeSut = () => {
    const userRepository = makeUserRepository()
    const hasher = makeHasher()
    const tokenGenerator = makeTokenGenerator()
    const sut = new RegisterUser(userRepository, hasher, tokenGenerator)
    return { sut, userRepository, hasher, tokenGenerator }
  }

  const validInput = {
    name: 'Maria',
    email: 'maria@email.com',
    phone: '11999999999',
    password: '123456',
    confirmpassword: '123456',
  }

  it('deve lançar erro se o nome não for informado', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, name: undefined }))
      .rejects.toThrow('O nome é obrigatório!')
  })

  it('deve lançar erro se o telefone não for informado', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, phone: undefined }))
      .rejects.toThrow('O telefone é obrigatório!')
  })

  it('deve lançar erro se a senha e a confirmação não baterem', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, confirmpassword: 'outra' }))
      .rejects.toThrow('A senha e a confirmação precisam ser iguais!')
  })

  it('deve lançar erro se o email já estiver em uso', async () => {
    const { sut, userRepository } = makeSut()
    userRepository.findByEmail.mockResolvedValue({ id: 'x', email: 'maria@email.com' })

    await expect(sut.execute(validInput))
      .rejects.toThrow('Por favor, utilize outro e-mail!')
  })

  it('deve criptografar a senha antes de salvar', async () => {
    const { sut, hasher, userRepository } = makeSut()
    await sut.execute(validInput)

    expect(hasher.hash).toHaveBeenCalledWith('123456')
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed-password' })
    )
  })

  it('deve retornar token e dados do usuário sem expor a senha', async () => {
    const { sut } = makeSut()
    const result = await sut.execute(validInput)

    expect(result).toEqual({
      message: 'Você está autenticado!',
      token: 'valid-token',
      userId: 'user-id',
    })
    expect(result.password).toBeUndefined()
  })
})