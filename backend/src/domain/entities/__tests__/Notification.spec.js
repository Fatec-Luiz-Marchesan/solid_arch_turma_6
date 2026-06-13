const { Notification } = require('../Notification')

describe('Entidade Notification (regras de negócio)', () => {

    const makeValid = (overrides = {}) => ({
        recipientId: 'user-1',
        message: 'Seu pet foi adotado!',
        priority: 'high',
        ...overrides,
    })

    it('deve criar uma notificação válida com defaults', () => {
        const notif = new Notification(makeValid())
        expect(notif.recipientId).toBe('user-1')
        expect(notif.message).toBe('Seu pet foi adotado!')
        expect(notif.priority).toBe('high')
        expect(notif.read).toBe(false)
    })

    it('deve lançar erro se o destinatário não for informado', () => {
        expect(() => new Notification(makeValid({ recipientId: undefined })))
        .toThrow('O destinatário da notificação é obrigatório!')
    })

    it('deve lançar erro se a mensagem não for informada', () => {
        expect(() => new Notification(makeValid({ message: undefined })))
        .toThrow('A mensagem da notificação é obrigatória!')
    })

    it('deve lançar erro se a prioridade for inválida', () => {
        expect(() => new Notification(makeValid({ priority: 'urgentissima' })))
        .toThrow('Prioridade inválida!')
    })

    it('deve assumir prioridade "normal" quando não informada', () => {
        const notif = new Notification(makeValid({ priority: undefined }))
        expect(notif.priority).toBe('normal')
    })

    it('deve marcar como lida apenas se não estiver expirada', () => {
        const futureDate = new Date(Date.now() + 60_000)
        const notif = new Notification(makeValid({ expiresAt: futureDate }))
        notif.markAsRead()
        expect(notif.read).toBe(true)
    })

    it('deve lançar erro ao marcar como lida uma notificação expirada', () => {
        const pastDate = new Date(Date.now() - 60_000)
        const notif = new Notification(makeValid({ expiresAt: pastDate }))
        expect(() => notif.markAsRead())
            .toThrow('Não é possível ler uma notificação expirada!')
    })
})