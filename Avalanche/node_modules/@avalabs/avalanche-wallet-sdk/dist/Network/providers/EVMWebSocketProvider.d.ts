import { ethers } from 'ethers';
import { WalletType } from "../../Wallet/types";
export declare class EVMWebSocketProvider {
    provider: ethers.providers.WebSocketProvider;
    wsUrl: string;
    wallets: WalletType[];
    constructor(wsUrl: string);
    setEndpoint(wsUrl: string): void;
    trackWallet(wallet: WalletType): void;
    removeWallet(wallet: WalletType): void;
    destroyConnection(): Promise<void>;
    reconnect(): Promise<void>;
    private addListeners;
    private removeListeners;
    private onBlock;
}
