import { NetworkConfig } from "../../Network";
import { SnowtraceErc20Tx, SnowtraceNormalTx, SnowtraceResponse } from "./types";
export declare function getErc20History(address: string, networkConfig: NetworkConfig, page?: number, offset?: number, contractAddress?: string): Promise<SnowtraceErc20Tx[]>;
export declare function getNormalHistory(address: string, networkConfig: NetworkConfig, page?: number, offset?: number): Promise<SnowtraceNormalTx[]>;
/**
 * https://docs.etherscan.io/api-endpoints/contracts#get-contract-abi-for-verified-contract-source-codes
 *
 * @param address
 * @param networkConfig
 * @returns string array, the first index is the ABI
 */
export declare function getABIForContract(address: string, networkConfig: NetworkConfig): Promise<SnowtraceResponse<string>>;
