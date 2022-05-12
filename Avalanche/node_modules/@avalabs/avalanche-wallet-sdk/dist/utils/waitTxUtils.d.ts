/**
 * Waits until the given tx id is accepted on X chain
 * @param txId Tx ID to wait for
 * @param tryCount Number of attempts until timeout
 */
export declare function waitTxX(txId: string, tryCount?: number): Promise<string>;
export declare function waitTxP(txId: string, tryCount?: number): Promise<string>;
export declare function waitTxEvm(txHash: string, tryCount?: number): Promise<string>;
export declare function waitTxC(txId: string, tryCount?: number): Promise<string>;
