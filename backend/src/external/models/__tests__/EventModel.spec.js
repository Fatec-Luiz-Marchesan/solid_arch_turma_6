const EventModel = require('../EventModel')
 
describe('EventModel (schema Mongoose)', () => {
  it('deve persistir um evento válido com os novos campos', async () => {
    const doc = await EventModel.create({
      title: 'Feira de adoção',
      startsAt: new Date('2026-06-20T09:00:00Z'),
      endsAt: new Date('2026-06-20T17:00:00Z'),
      organizerId: 'user-1',
      location: 'Praça Central',
      capacity: 50,
    })
 
    expect(doc._id).toBeDefined()
    expect(doc.location).toBe('Praça Central')
    expect(doc.capacity).toBe(50)
  })
 
  it('deve assumir capacity = 1 por padrão quando não informada', async () => {
    const doc = await EventModel.create({
      title: 'Mini evento',
      startsAt: new Date('2026-06-20T09:00:00Z'),
      endsAt: new Date('2026-06-20T10:00:00Z'),
      organizerId: 'user-1',
    })
 
    expect(doc.capacity).toBe(1)
  })
 
  it('deve rejeitar capacity menor que 1 (validação de mínimo)', async () => {
    await expect(
      EventModel.create({
        title: 'Evento inválido',
        startsAt: new Date('2026-06-20T09:00:00Z'),
        endsAt: new Date('2026-06-20T10:00:00Z'),
        organizerId: 'user-1',
        capacity: 0,
      })
 
    ).rejects.toThrow()
  })
 
  it('deve assumir status = "scheduled" por padrão quando não informado', async () => {
    const doc = await EventModel.create({
      title: 'Evento sem status',
      startsAt: new Date('2026-06-20T09:00:00Z'),
      endsAt: new Date('2026-06-20T10:00:00Z'),
      organizerId: 'user-1',
    })
 
    expect(doc.status).toBe('scheduled')
  })
 
  it('deve aceitar um status válido do enum', async () => {
    const doc = await EventModel.create({
      title: 'Evento cancelado',
      startsAt: new Date('2026-06-20T09:00:00Z'),
      endsAt: new Date('2026-06-20T10:00:00Z'),
      organizerId: 'user-1',
      status: 'cancelled',
    })
 
    expect(doc.status).toBe('cancelled')
  })
 
  it('deve rejeitar um status fora do enum permitido', async () => {
    await expect(
      EventModel.create({
        title: 'Evento status inválido',
        startsAt: new Date('2026-06-20T09:00:00Z'),
        endsAt: new Date('2026-06-20T10:00:00Z'),
        organizerId: 'user-1',
        status: 'pizza',
      })
    ).rejects.toThrow()
  })
})