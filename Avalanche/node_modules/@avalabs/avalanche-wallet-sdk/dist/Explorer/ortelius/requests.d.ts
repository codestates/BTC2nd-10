import { OrteliusAvalancheTx, OrteliusEvmTx } from "./..";
/**
 * Returns transactions FROM and TO the address given
 * @param addr The address to get historic transactions for.
 */
export declare function getAddressHistoryEVM(addr: string): Promise<OrteliusEvmTx[]>;
/**
 * Returns the ortelius data from the given tx id.
 * @param txID
 */
export declare function getTx(txID: string): Promise<OrteliusAvalancheTx>;
/**
 * Returns ortelius data for a transaction hash on C chain EVM,
 * @param txHash
 */
export declare function getTxEvm(txHash: string): Promise<OrteliusEvmTx>;
/**
 * Returns, X or P chain transactions belonging to the given address array.
 * @param addrs Addresses to check for.
 * @param limit
 * @param chainID The blockchain ID of X or P chain
 * @param endTime
 */
export declare function getAddressHistory(addrs: string[], limit: number | undefined, chainID: string, endTime?: string): Promise<OrteliusAvalancheTx[]>;
/**
 * Given an array of addresses, checks which chain each address was already used on
 * @param addrs
 */
export declare function getAddressChains(addrs: string[]): Promise<any>;
export declare function getAddressDetailX(addr: string): Promise<any>;
