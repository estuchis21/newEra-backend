import { Test, TestingModule } from '@nestjs/testing';
import { ProfesoresController } from './profesores.controller';
import { ProfesoresService } from './profesores.service';

describe('ProfesoresController', () => {
  let controller: ProfesoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfesoresController],
      providers: [ProfesoresService],
    }).compile();

    controller = module.get<ProfesoresController>(ProfesoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
