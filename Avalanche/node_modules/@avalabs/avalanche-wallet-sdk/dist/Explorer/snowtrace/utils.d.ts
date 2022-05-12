import { SnowtraceErc20Tx, SnowtraceNormalTx } from "./..";
/**
 * Filter duplicate Snowtrace transactions
 * @param txs
 */
export declare function filterDuplicateTransactions<Tx extends SnowtraceErc20Tx | SnowtraceNormalTx>(txs: Tx[]): Tx[];
