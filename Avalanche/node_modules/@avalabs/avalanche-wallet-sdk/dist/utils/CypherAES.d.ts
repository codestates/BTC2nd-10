/**
 * A helper class to obfuscate strings when storing in memory. Used as a helper rather than secure encryption.
 * @Remarks Do NOT use this class for actual secure encryption needs.
 */
export declare class CypherAES {
    private pass;
    private encrypted;
    constructor(value: string);
    getValue(): string;
}
