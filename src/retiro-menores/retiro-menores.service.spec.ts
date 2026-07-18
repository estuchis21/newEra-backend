import { Test, TestingModule } from '@nestjs/testing';
import { RetiroMenoresService } from './retiro-menores.service';

describe('RetiroMenoresService', () => {
  let service: RetiroMenoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetiroMenoresService],
    }).compile();

    service = module.get<RetiroMenoresService>(RetiroMenoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
