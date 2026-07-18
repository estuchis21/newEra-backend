import { Test, TestingModule } from '@nestjs/testing';
import { CuotasRepository } from './cuotas.repository';

describe('CuotasRepository', () => {
  let provider: CuotasRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuotasRepository],
    }).compile();

    provider = module.get<CuotasRepository>(CuotasRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
