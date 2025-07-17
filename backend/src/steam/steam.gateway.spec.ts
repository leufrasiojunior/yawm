import { Test, TestingModule } from '@nestjs/testing';
import { SteamGateway } from './steam.gateway';

describe('SteamGateway', () => {
  let gateway: SteamGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SteamGateway],
    }).compile();

    gateway = module.get<SteamGateway>(SteamGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
