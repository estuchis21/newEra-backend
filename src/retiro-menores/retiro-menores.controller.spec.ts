import { Test, TestingModule } from '@nestjs/testing';
import { RetiroMenoresController } from './retiro-menores.controller';
import { RetiroMenoresService } from './retiro-menores.service';

describe('RetiroMenoresController', () => {
  let controller: RetiroMenoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetiroMenoresController],
      providers: [RetiroMenoresService],
    }).compile();

    controller = module.get<RetiroMenoresController>(RetiroMenoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
