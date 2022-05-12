/**
 * Fetches the current AVAX price using Coin Gecko.
 * @remarks
 * You might get rate limited if you use this function frequently.
 *
 * @return
 * Current price of 1 AVAX vs a currency (default USD)
 */
export declare function getAvaxPrice(currentCurrency?: string): Promise<number>;
/**
 * Gets daily price history using Coin Gecko.
 * @param currency
 */
export declare function getAvaxPriceHistory(currency?: string): Promise<[timestamp: number, price: number][]>;
