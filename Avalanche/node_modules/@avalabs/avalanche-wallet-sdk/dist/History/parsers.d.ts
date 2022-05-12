import { HistoryItemType } from "./";
import { OrteliusAvalancheTx } from "../Explorer";
export declare function getTransactionSummary(tx: OrteliusAvalancheTx, walletAddrs: string[], evmAddress: string): Promise<HistoryItemType>;
