const { AuthenticateUser } = require('../AuthenticateUser')

describe('AuthenticateUser Use Case', () => {
  // Mock do repositório de usuário (porta)
  const makeUserRepository = () => ({
    findByEmail: jest.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Maria',
      email: 'maria@email.com',
      password: 'hashed-password',
    }),
  })

  // Mock do comparador de senha (porta)
  const makeHashComparer = () => ({
    compare: jest.fn().mockResolvedValue(true),
  })

  // Mock do gerador de token (porta)
  const makeTokenGenerator = () => ({
    generate: jest.fn().mockReturnValue('valid-token'),
  })

  const makeSut = () => {
    const userRepository = makeUserRepository()
    const hashComparer = makeHashComparer()
    const tokenGenerator = makeTokenGenerator()
    const sut = new AuthenticateUser(userRepository, hashComparer, tokenGenerator)
    return { sut, userRepository, hashComparer, tokenGenerator }
  }

  const validInput = { email: 'maria@email.com', password: '123456' }

  it('deve lançar erro se o email não for informado', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, email: undefined }))
      .rejects.toThrow('O e-mail é obrigatório!')
  })

  it('deve lançar erro se a senha não for informada', async () => {
    const { sut } = makeSut()
    await expect(sut.execute({ ...validInput, password: undefined }))
      .rejects.toThrow('A senha é obrigatória!')
  })

  it('deve lançar erro se não houver usuário com o email informado', async () => {
    const { sut, userRepository } = makeSut()
    userRepository.findByEmail.mockResolvedValue(null)

    await expect(sut.execute(validInput))
      .rejects.toThrow('Não há usuário cadastrado com este e-mail!')
  })

  it('deve lançar erro se a senha não bater', async () => {
    const { sut, hashComparer } = makeSut()
    hashComparer.compare.mockResolvedValue(false)

    await expect(sut.execute(validInput))
      .rejects.toThrow('Senha inválida')
  })

  it('deve comparar a senha enviada com o hash armazenado', async () => {
    const { sut, hashComparer } = makeSut()
    await sut.execute(validInput)

    expect(hashComparer.compare).toHaveBeenCalledWith('123456', 'hashed-password')
  })

  it('deve retornar token e dados do usuário em caso de sucesso', async () => {
    const { sut } = makeSut()
    const result = await sut.execute(validInput)

    expect(result).toEqual({
      message: 'Você está autenticado!',
      token: 'valid-token',
      userId: 'user-1',
    })
  })

  it('não deve expor a senha no retorno', async () => {
    const { sut } = makeSut()
    const result = await sut.execute(validInput)
    expect(result.password).toBeUndefined()
  })
})