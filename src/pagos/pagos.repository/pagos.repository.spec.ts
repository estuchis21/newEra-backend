import { Test, TestingModule } from '@nestjs/testing';
import { PagosRepository } from './pagos.repository';

describe('PagosRepository', () => {
  let provider: PagosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosRepository],
    }).compile();

    provider = module.get<PagosRepository>(PagosRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
