const { Notification } = require('../domain/entities/Notification')

class MarkNotificationAsRead {
    constructor(notificationRepository){
        this.notificationRepository = notificationRepository
    }

    async execute(notificationId){
        const data = await this.notificationRepository.findById(notificationId)
        if (!data) {
            throw new Error('Notificação não encontrada!')
        }

        const notification = new Notification(data)
        notification.markAsRead()

        return this.notificationRepository.save(notification)
    }
}

module.exports = { MarkNotificationAsRead}