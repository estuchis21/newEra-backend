import { Test, TestingModule } from '@nestjs/testing';
import { BoletinesRepository } from './boletines.repository';

describe('BoletinesRepository', () => {
  let provider: BoletinesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoletinesRepository],
    }).compile();

    provider = module.get<BoletinesRepository>(BoletinesRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
