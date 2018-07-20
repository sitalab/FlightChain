import { Module } from '@nestjs/common';
import {FlightChainController} from "./flight-chain.controller";
import {FlightChainService} from "./fight-chain.service";

@Module({
  imports: [],
  controllers: [FlightChainController],
  providers: [FlightChainService],
})
export class FlightChainModule {}
