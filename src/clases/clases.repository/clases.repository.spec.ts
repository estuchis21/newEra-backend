import { Test, TestingModule } from '@nestjs/testing';
import { ClasesRepository } from './clases.repository';

describe('ClasesRepository', () => {
  let provider: ClasesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClasesRepository],
    }).compile();

    provider = module.get<ClasesRepository>(ClasesRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
