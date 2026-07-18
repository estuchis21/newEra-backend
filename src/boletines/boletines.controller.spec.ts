import { Test, TestingModule } from '@nestjs/testing';
import { BoletinesController } from './boletines.controller';
import { BoletinesService } from './boletines.service';

describe('BoletinesController', () => {
  let controller: BoletinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoletinesController],
      providers: [BoletinesService],
    }).compile();

    controller = module.get<BoletinesController>(BoletinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
