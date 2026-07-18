import { Test, TestingModule } from '@nestjs/testing';
import { RetiroMenoresRepository } from './retiro-menores.repository';

describe('RetiroMenoresRepository', () => {
  let provider: RetiroMenoresRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetiroMenoresRepository],
    }).compile();

    provider = module.get<RetiroMenoresRepository>(RetiroMenoresRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
