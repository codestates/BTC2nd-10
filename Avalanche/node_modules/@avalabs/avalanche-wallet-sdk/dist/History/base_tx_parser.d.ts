import { iHistoryBaseTx } from "./";
import { OrteliusAvalancheTx } from "../Explorer";
export declare function getBaseTxSummary(tx: OrteliusAvalancheTx, ownerAddrs: string[]): Promise<iHistoryBaseTx>;
