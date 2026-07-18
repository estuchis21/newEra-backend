import { Test, TestingModule } from '@nestjs/testing';
import { HorariosRepository } from './horarios.repository';

describe('HorariosRepository', () => {
  let provider: HorariosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HorariosRepository],
    }).compile();

    provider = module.get<HorariosRepository>(HorariosRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
