class Event {
  constructor({ title, startsAt, endsAt, organizerId, location, capacity, status }, now = new Date()) {
    if (!title) {
      throw new Error('O título do evento é obrigatório!')
    }
    if (!organizerId) {
      throw new Error('O organizador do evento é obrigatório!')
    }
 
    const start = new Date(startsAt)
    const end = new Date(endsAt)
 
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error('Datas do evento inválidas!')
    }
    if (start.getTime() < now.getTime()) {
      throw new Error('O evento não pode começar no passado!')
    }
    if (end.getTime() <= start.getTime()) {
      throw new Error('A data de término deve ser posterior à de início!')
    }
 
    const finalCapacity = capacity === undefined ? 1 : capacity
    if (finalCapacity < 1) {
      throw new Error('A capacidade mínima do evento é 1!')
    }
 
    const allowedStatus = ['scheduled', 'cancelled', 'finished']
    const finalStatus = status === undefined ? 'scheduled' : status
    if (!allowedStatus.includes(finalStatus)) {
      throw new Error('Status de evento inválido!')
    }
 
    this.title = title
    this.startsAt = start
    this.endsAt = end
    this.organizerId = organizerId
    this.location = location || ''
    this.capacity = finalCapacity
    this.status = finalStatus
  }
}
 
module.exports = { Event }