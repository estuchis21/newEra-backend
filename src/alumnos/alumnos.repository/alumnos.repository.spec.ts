import { Test, TestingModule } from '@nestjs/testing';
import { AlumnosRepository } from './alumnos.repository';

describe('AlumnosRepository', () => {
  let provider: AlumnosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlumnosRepository],
    }).compile();

    provider = module.get<AlumnosRepository>(AlumnosRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
