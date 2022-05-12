export declare class HttpClient {
    private baseURL;
    private TIMEOUT;
    constructor(baseURL: string);
    get<T>(path: string, params?: Record<string, any>): Promise<T>;
    post<T>(path: string, data: Record<string, any>): Promise<T>;
    private handleResponse;
    private fetchWithTimeout;
}
