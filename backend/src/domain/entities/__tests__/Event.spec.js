const { Event } = require('../Event')
 
describe('Entidade Event (regras de domínio)', () => {
  const now = new Date('2026-01-01T00:00:00Z')
 
  const makeValidData = (overrides = {}) => ({
    title: 'Feira de adoção',
    startsAt: new Date('2026-06-20T09:00:00Z'),
    endsAt: new Date('2026-06-20T17:00:00Z'),
    organizerId: 'user-1',
    location: 'Praça Central',
    capacity: 50,
    ...overrides,
  })
 
  it('deve nascer com status "scheduled" por padrão', () => {
    const event = new Event(makeValidData(), now)
    expect(event.status).toBe('scheduled')
  })
 
  it('deve aceitar um status válido do enum', () => {
    const event = new Event(makeValidData({ status: 'cancelled' }), now)
    expect(event.status).toBe('cancelled')
  })
 
  it('deve lançar erro para um status fora do enum permitido', () => {
    expect(() => new Event(makeValidData({ status: 'pizza' }), now))
      .toThrow('Status de evento inválido!')
  })
})