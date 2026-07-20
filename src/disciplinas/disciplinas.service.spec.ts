import { Test, TestingModule } from '@nestjs/testing';
import { DisciplinasService } from './disciplinas.service';

describe('DisciplinasService', () => {
  let service: DisciplinasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisciplinasService],
    }).compile();

    service = module.get<DisciplinasService>(DisciplinasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
