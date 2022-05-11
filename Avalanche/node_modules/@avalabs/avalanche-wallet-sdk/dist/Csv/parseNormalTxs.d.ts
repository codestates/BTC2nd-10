import { HistoryItemType } from "../History";
/**
 * Given an array of history transactions, filter the base and export/import txs and returns the body of a csv file.
 * @remarks You can download the returned string as a CSV file.
 * @param txs An array of transactions made by a wallet.
 */
export declare function createCsvNormal(txs: HistoryItemType[]): string;
export declare function parseNormalTxs(txs: HistoryItemType[]): string[][];
