import {AcrisFlight} from "./AcrisFlight";


class FabricTimestamp {
  /**
   * Contains the unix timestamp
   */
  low: number;
  high: number;
  unsigned: boolean;
}

/**
 * Represents the object returned from the API to get the flight history.
 */
export class FlightChainHistory {
  /**
   * The ACRIS flight data
   */
  value: AcrisFlight;
  is_delete: boolean;
  tx_id: string;
  timestamp: FabricTimestamp

}
