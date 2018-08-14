import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FlightChainService} from "../flight-chain/flight-chain.service";
import {NGXLogger} from "ngx-logger";

@Component({
  selector: 'app-flight-chain-transaction',
  templateUrl: './flight-chain-transaction.component.html',
  styleUrls: ['./flight-chain-transaction.component.css']
})
export class FlightChainTransactionComponent implements OnInit {

  transactionInfo = null;

  constructor(private route: ActivatedRoute,
              private flightChainService: FlightChainService,
              private _logger: NGXLogger) {
  }

  ngOnInit() {
    this.getTransactionDetails();
  }


  getTransactionDetails(): void {
    const id: string = this.route.snapshot.paramMap.get('transactionId');
    this.flightChainService.getTransaction(id)
      .subscribe(transactionInfo => this.transactionInfo = transactionInfo);
  }

}
