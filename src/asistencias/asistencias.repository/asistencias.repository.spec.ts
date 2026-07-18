import { Test, TestingModule } from '@nestjs/testing';
import { AsistenciasRepository } from './asistencias.repository';

describe('AsistenciasRepository', () => {
  let provider: AsistenciasRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsistenciasRepository],
    }).compile();

    provider = module.get<AsistenciasRepository>(AsistenciasRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
