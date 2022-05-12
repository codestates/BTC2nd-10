import { NetworkConfig } from "./types";
export declare function setNetwork(conf: NetworkConfig): void;
/**
 * Unlike `setNetwork` this function will fail if the network is not available.
 * @param conf
 */
export declare function setNetworkAsync(conf: NetworkConfig): Promise<void>;
