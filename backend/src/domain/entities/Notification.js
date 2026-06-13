const VALID_PRIORITIES = ['low', 'normal', 'high']

class Notification {
    constructor({ recipientId, message, priority, read, expiresAt }) {
        if (!recipientId) {
            throw new Error('O destinatário da notificação é obrigatório!')
        }
        if (!message) {
            throw new Error('A mensagem da notificação é obrigatória!')
        }

        const finalPriority = priority || 'normal'
        if (!VALID_PRIORITIES.includes(finalPriority)) {
            throw new Error ('Prioridade inválida!')
        }

        this.recipientId = recipientId
        this.message = message
        this.priority = finalPriority
        this.read = read || false
        this.expiresAt = expiresAt || null
    }

    isExpired() {
        if (!this.expiresAt) return false
        return new Date(this.expiresAt).getTime() < Date.now()
    }

    markAsRead() {
        if (this.isExpired()) {
            throw new Error('Não é possível ler uma notificação expirada!')
        }
        this.read = true
    }
}

module.exports = { Notification, VALID_PRIORITIES }