import { Test, TestingModule } from '@nestjs/testing';
import { BoletinesService } from './boletines.service';

describe('BoletinesService', () => {
  let service: BoletinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoletinesService],
    }).compile();

    service = module.get<BoletinesService>(BoletinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
