const UpdatePetUseCase = require('../../src/domain/usecases/UpdatePetUseCase');
describe('UpdatePetUseCase', () => {
let petRepository;
let usecase;
beforeEach(() => {
petRepository = {
findById: jest.fn(),
update: jest.fn(),
};
usecase = new UpdatePetUseCase({ petRepository });
});
it('atualiza name com sucesso', async () => {
petRepository.findById.mockResolvedValue({ id: 'p1', name: 'Rex' });
petRepository.update.mockResolvedValue({ id: 'p1', name: 'Rex Junior' });
const result = await usecase.execute({ id: 'p1', name: 'Rex Junior' });
expect(result.name).toBe('Rex Junior');
expect(petRepository.update).toHaveBeenCalledWith('p1', { name: 'Rex Junior' });
});
it('retorna null se pet nao existe', async () => {
petRepository.findById.mockResolvedValue(null);
const result = await usecase.execute({ id: 'inexistente', name: 'X' });
expect(result).toBeNull();
expect(petRepository.update).not.toHaveBeenCalled();
});
it('rejeita update sem id', async () => {
await expect(usecase.execute({ name: 'Rex' }))
.rejects.toThrow('id e obrigatorio');
});
it('rejeita name muito curto', async () => {
petRepository.findById.mockResolvedValue({ id: 'p1', name: 'Rex' });
await expect(usecase.execute({ id: 'p1', name: 'A' }))
.rejects.toThrow();
});
it('nao chama update se findById falhar', async () => {
petRepository.findById.mockResolvedValue(null);
await usecase.execute({ id: 'p1', name: 'Novo' });
expect(petRepository.update).not.toHaveBeenCalled();
});
});
