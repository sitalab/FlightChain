import { Test, TestingModule } from '@nestjs/testing';
import {FlightChainController} from './flight-chain.controller';
import {FlightChainService} from "./fight-chain.service";

describe('FlightChainController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [FlightChainController],
      providers: [FlightChainService],
    }).compile();
  });
/*
  describe('root', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get<FlightChainController>(FlightChainController);
      expect(appController.root()).toBe('Hello World!');
    });
  });
  */
});
