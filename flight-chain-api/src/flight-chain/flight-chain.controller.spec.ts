import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import {FlightChainController} from './flight-chain.controller';

describe('FlightChainController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [FlightChainController],
      providers: [AppService],
    }).compile();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get<FlightChainController>(FlightChainController);
      expect(appController.root()).toBe('Hello World!');
    });
  });
});
