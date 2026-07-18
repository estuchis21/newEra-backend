import { Test, TestingModule } from '@nestjs/testing';
import { DisciplinasRepository } from './disciplinas.repository';

describe('DisciplinasRepository', () => {
  let provider: DisciplinasRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisciplinasRepository],
    }).compile();

    provider = module.get<DisciplinasRepository>(DisciplinasRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
