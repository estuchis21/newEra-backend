import { Test, TestingModule } from '@nestjs/testing';
import { InscripcionesRepository } from './inscripciones.repository';

describe('InscripcionesRepository', () => {
  let provider: InscripcionesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InscripcionesRepository],
    }).compile();

    provider = module.get<InscripcionesRepository>(InscripcionesRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
