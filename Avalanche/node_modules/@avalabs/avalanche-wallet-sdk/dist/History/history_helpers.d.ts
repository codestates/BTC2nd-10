import { OrteliusUTXO } from "../Explorer";
import { iHistoryNftFamilyBalance } from "./types";
/**
 * Parse the raw memo field to readable text.
 * @param raw
 */
export declare function parseMemo(raw: string): string;
export declare function getNFTBalanceFromUTXOs(utxos: OrteliusUTXO[], addresses: string[], assetID: string): iHistoryNftFamilyBalance;
