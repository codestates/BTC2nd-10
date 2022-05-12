/// <reference types="node" />
import { NetworkConfig } from "./types";
import EventEmitter from 'events';
/**
 * Fire network change event
 * @param newNetwork The newly connected network config
 */
export declare function emitNetworkChange(newNetwork: NetworkConfig): void;
export declare const networkEvents: EventEmitter;
