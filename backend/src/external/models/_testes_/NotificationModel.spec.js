
const NotificationModel = require('../NotificationModel')

describe('NotificationModel (Schema)', () => {
  it('deve ter os campos obrigatórios recipient e message', () => {
    const notification = new NotificationModel({})
    const err = notification.validateSync()

    expect(err.errors.recipient).toBeDefined()
    expect(err.errors.message).toBeDefined()
  })

  it('deve aplicar read=false por padrão', () => {
    const notification = new NotificationModel({
      recipient: 'user-id',
      message: 'Olá!',
    })

    expect(notification.read).toBe(false)
  })

  it('deve aceitar um channel informado', () => {
    const notification = new NotificationModel({
      recipient: 'user-id',
      message: 'Olá!',
      channel: 'email',
    })

    expect(notification.channel).toBe('email')
  })

  it('não deve apresentar erro de validação quando recipient e message são informados', () => {
    const notification = new NotificationModel({
      recipient: 'user-id',
      message: 'Olá!',
    })
    const err = notification.validateSync()

    expect(err).toBeUndefined()
  })
})