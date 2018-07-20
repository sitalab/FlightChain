import { Module } from '@nestjs/common';
import {FlightChainModule} from "./flight-chain/flight-chain.module";

@Module({
  imports: [FlightChainModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
