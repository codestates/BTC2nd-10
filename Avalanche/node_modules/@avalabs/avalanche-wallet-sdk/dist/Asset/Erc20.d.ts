import { Erc20Store, Erc20TokenData } from "./types";
import { Erc20Token } from "./Erc20Token";
export declare let erc20Cache: Erc20Store;
export declare function getErc20Cache(): Erc20Store;
/**
 * Clears the internal erc20 cache.
 */
export declare function bustErc20Cache(): void;
/**
 * Initates and caches an erc20 token from the given data.
 * @param data Information such as name, symbol, and address about the ERC20 token.
 */
export declare function addErc20TokenFromData(data: Erc20TokenData): Erc20Token;
export declare function getContractDataErc20(address: string): Promise<Erc20TokenData>;
export declare function getErc20Token(address: string): Promise<Erc20Token>;
