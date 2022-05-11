import { ChainIdType } from "../common";
export declare const validateAddress: (address: string) => boolean | string;
export declare function validateAddressX(address: string): boolean;
export declare function validateAddressP(address: string): boolean;
export declare function validateAddressEVM(address: string): boolean;
/**
 * Returns the human readable part of a X or P bech32 address.
 * @param address
 */
export declare function getAddressHRP(address: string): string;
/**
 * Given an address, return which Chain it belongs to
 * @param address
 */
export declare function getAddressChain(address: string): ChainIdType;
