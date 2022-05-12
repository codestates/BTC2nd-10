import { HistoryItemType, iHistoryStaking } from "../History";
/**
 * Given an array of history transactions, filter the staking txs and returns the body of a csv file.
 * @remarks You can download the returned string as a CSV file.
 * @param txs An array of transactions made by a wallet.
 */
export declare function createCsvStaking(txs: HistoryItemType[]): string;
/**
 * Parses each staking transaction according to the headers defined in constants and returns an array of strings for
 * each cell in the CSV.
 * @param txs
 */
export declare function parseStakingTxs(txs: iHistoryStaking[]): string[][];
