import { ethers } from 'ethers';
import { NetworkConfig } from "./types";
export declare function getEthersJsonRpcProvider(config: NetworkConfig): ethers.providers.JsonRpcProvider;
