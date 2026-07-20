import { Test, TestingModule } from '@nestjs/testing';
import { ProfesoresRepository } from './profesores.repository';

describe('ProfesoresRepository', () => {
  let provider: ProfesoresRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfesoresRepository],
    }).compile();

    provider = module.get<ProfesoresRepository>(ProfesoresRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
