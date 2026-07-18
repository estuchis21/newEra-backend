import { Test, TestingModule } from '@nestjs/testing';
import { GruposRepository } from './grupos.repository';

describe('GruposRepository', () => {
  let provider: GruposRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GruposRepository],
    }).compile();

    provider = module.get<GruposRepository>(GruposRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
