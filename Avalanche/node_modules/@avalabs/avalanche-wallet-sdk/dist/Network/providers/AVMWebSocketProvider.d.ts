import Sockette from 'sockette';
import { WalletType } from "../../Wallet/types";
export declare class AVMWebSocketProvider {
    isConnected: boolean;
    socket: Sockette;
    wallets: WalletType[];
    boundHandler: any;
    constructor(wsUrl: string);
    /**
     * Starts watching for transactions on this wallet.
     * @param wallet The wallet instance to track
     */
    trackWallet(wallet: WalletType): void;
    onWalletAddressChange(): void;
    removeWallet(w: WalletType): void;
    setEndpoint(wsUrl: string): void;
    clearFilter(): void;
    /**
     * Creates a bloom filter from the addresses of the tracked wallets and subscribes to
     * transactions on the node.
     */
    updateFilterAddresses(): void;
    private updateWalletBalanceX;
    private onOpen;
    private onMessage;
    private onClose;
    private onError;
}
