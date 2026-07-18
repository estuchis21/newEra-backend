import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosRepository } from './usuarios.repository';

describe('UsuariosRepository', () => {
  let provider: UsuariosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosRepository],
    }).compile();

    provider = module.get<UsuariosRepository>(UsuariosRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
