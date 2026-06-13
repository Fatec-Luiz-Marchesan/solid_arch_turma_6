const { MarkNotificationAsRead } = require('../MarkNotificationAsRead')

describe('MarkNotificationAsRead Use Case', () => {
    const makeNotificationRepository = (notification) => ({
        findById: jest.fn().mockResolvedValue(notification),
        save: jest.fn().mockImplementation(async (n) => n),
    })
    
    it('deve marcar uma notificação válida como lida e salvar', async () => {
        const repo = makeNotificationRepository({
            recipientId: 'user-1',
            message: 'oi',
            priority: 'normal',
            read: false,
            expiresAt: null,
    })

    const sut = new MarkNotificationAsRead(repo)

    const result = await sut.execute('notif-1')

    expect(repo.findById).toHaveBeenCalledWith('notif-1')
    expect(repo.save).toHaveBeenCalledTimes(1)
    expect(result.read).toBe(true)
    })

    it('deve lançar erro se a notificação não existir', async () => {
        const repo = makeNotificationRepository(null)
        const sut = new MarkNotificationAsRead(repo)
    
        await expect(sut.execute('inexistente'))
            .rejects.toThrow('Notificação não encontrada!')
        expect(repo.save).not.toHaveBeenCalled()
    })

    it('não deve salvar se a notificação estiver expirada', async () => {
        const repo = makeNotificationRepository({
            recipientId: 'user-1',
            message: 'oi',
            priority: 'normal',
            read: false,
            expiresAt: new Date(Date.now() - 60_000),
        })
        const sut = new MarkNotificationAsRead(repo)

        await expect(sut.execute('notif-1'))
            .rejects.toThrow('Não é possível ler uma notificação expirada!')
        expect(repo.save).not.toHaveBeenCalled()
    })
})