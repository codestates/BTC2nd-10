/**
 * HttpProvider should be used to send rpc calls over http
 */
export declare class FetchHttpProvider {
    private host;
    withCredentials: boolean;
    timeout: number;
    headers?: {
        name: string;
        value: string;
    }[];
    agent?: string;
    connected: boolean;
    constructor(host: string, options?: {
        withCredentials?: boolean;
        timeout?: number;
        headers?: {
            name: string;
            value: string;
        }[];
        agent?: string;
        keepAlive?: boolean;
    });
    private prepareRequest;
    send(payload: unknown, callback: (error: Error | null, response?: any) => void): void;
    disconnect(): void;
    supportsSubscriptions(): boolean;
}
