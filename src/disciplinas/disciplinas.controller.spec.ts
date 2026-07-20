import { Test, TestingModule } from '@nestjs/testing';
import { DisciplinasController } from './disciplinas.controller';
import { DisciplinasService } from './disciplinas.service';

describe('DisciplinasController', () => {
  let controller: DisciplinasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisciplinasController],
      providers: [DisciplinasService],
    }).compile();

    controller = module.get<DisciplinasController>(DisciplinasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
