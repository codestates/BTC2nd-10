"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-Transactions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tx = exports.UnsignedTx = exports.SelectTxClass = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const credentials_1 = require("./credentials");
const evmtx_1 = require("../../common/evmtx");
const create_hash_1 = __importDefault(require("create-hash"));
const importtx_1 = require("./importtx");
const exporttx_1 = require("./exporttx");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[EVMBaseTx]] instance.
 *
 * @param txTypeID The id of the transaction type
 *
 * @returns An instance of an [[EVMBaseTx]]-extended class.
 */
const SelectTxClass = (txTypeID, ...args) => {
    if (txTypeID === constants_1.EVMConstants.IMPORTTX) {
        return new importtx_1.ImportTx(...args);
    }
    else if (txTypeID === constants_1.EVMConstants.EXPORTTX) {
        return new exporttx_1.ExportTx(...args);
    }
    /* istanbul ignore next */
    throw new Error("TransactionError - SelectTxClass: unknown txType");
};
exports.SelectTxClass = SelectTxClass;
class UnsignedTx extends evmtx_1.EVMStandardUnsignedTx {
    constructor() {
        super(...arguments);
        this._typeName = "UnsignedTx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.transaction = (0, exports.SelectTxClass)(fields["transaction"]["_typeID"]);
        this.transaction.deserialize(fields["transaction"], encoding);
    }
    getTransaction() {
        return this.transaction;
    }
    fromBuffer(bytes, offset = 0) {
        this.codecID = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        const txtype = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.transaction = (0, exports.SelectTxClass)(txtype);
        return this.transaction.fromBuffer(bytes, offset);
    }
    /**
     * Signs this [[UnsignedTx]] and returns signed [[StandardTx]]
     *
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns A signed [[StandardTx]]
     */
    sign(kc) {
        const txbuff = this.toBuffer();
        const msg = buffer_1.Buffer.from((0, create_hash_1.default)("sha256").update(txbuff).digest());
        const sigs = this.transaction.sign(msg, kc);
        return new Tx(this, sigs);
    }
}
exports.UnsignedTx = UnsignedTx;
class Tx extends evmtx_1.EVMStandardTx {
    constructor() {
        super(...arguments);
        this._typeName = "Tx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.unsignedTx = new UnsignedTx();
        this.unsignedTx.deserialize(fields["unsignedTx"], encoding);
        this.credentials = [];
        for (let i = 0; i < fields["credentials"].length; i++) {
            const cred = (0, credentials_1.SelectCredentialClass)(fields["credentials"][`${i}`]["_typeID"]);
            cred.deserialize(fields["credentials"][`${i}`], encoding);
            this.credentials.push(cred);
        }
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[Tx]], parses it,
     * populates the class, and returns the length of the Tx in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[Tx]]
     * @param offset A number representing the starting point of the bytes to begin parsing
     *
     * @returns The length of the raw [[Tx]]
     */
    fromBuffer(bytes, offset = 0) {
        this.unsignedTx = new UnsignedTx();
        offset = this.unsignedTx.fromBuffer(bytes, offset);
        const numcreds = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.credentials = [];
        for (let i = 0; i < numcreds; i++) {
            const credid = bintools
                .copyFrom(bytes, offset, offset + 4)
                .readUInt32BE(0);
            offset += 4;
            const cred = (0, credentials_1.SelectCredentialClass)(credid);
            offset = cred.fromBuffer(bytes, offset);
            this.credentials.push(cred);
        }
        return offset;
    }
}
exports.Tx = Tx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0vdHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBMEM7QUFDMUMsK0NBQXFEO0FBR3JELDhDQUF5RTtBQUN6RSw4REFBb0M7QUFFcEMseUNBQXFDO0FBQ3JDLHlDQUFxQztBQUlyQzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFakQ7Ozs7OztHQU1HO0FBQ0ksTUFBTSxhQUFhLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEdBQUcsSUFBVyxFQUFhLEVBQUU7SUFDM0UsSUFBSSxRQUFRLEtBQUssd0JBQVksQ0FBQyxRQUFRLEVBQUU7UUFDdEMsT0FBTyxJQUFJLG1CQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUM3QjtTQUFNLElBQUksUUFBUSxLQUFLLHdCQUFZLENBQUMsUUFBUSxFQUFFO1FBQzdDLE9BQU8sSUFBSSxtQkFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDN0I7SUFDRCwwQkFBMEI7SUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFBO0FBQ3JFLENBQUMsQ0FBQTtBQVJZLFFBQUEsYUFBYSxpQkFRekI7QUFFRCxNQUFhLFVBQVcsU0FBUSw2QkFJL0I7SUFKRDs7UUFLWSxjQUFTLEdBQUcsWUFBWSxDQUFBO1FBQ3hCLFlBQU8sR0FBRyxTQUFTLENBQUE7SUF3Qy9CLENBQUM7SUF0Q0Msd0JBQXdCO0lBRXhCLFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztRQUM5RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUEscUJBQWEsRUFBQyxNQUFNLENBQUMsYUFBYSxD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LEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ2xELE1BQU0sUUFBUSxHQUFXLFFBQVE7YUFDOUIsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUNuQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFBO1FBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekMsTUFBTSxNQUFNLEdBQVcsUUFBUTtpQkFDNUIsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQztpQkFDbkMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xCLE1BQU0sSUFBSSxDQUFDLENBQUE7WUFDWCxNQUFNLElBQUksR0FBZSxJQUFBLG1DQUFxQixFQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3RELE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUM1QjtRQUNELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztDQUNGO0FBaERELGdCQWdEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1FVk0tVHJhbnNhY3Rpb25zXG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBFVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSBcIi4vY3JlZGVudGlhbHNcIlxuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tIFwiLi9rZXljaGFpblwiXG5pbXBvcnQgeyBDcmVkZW50aWFsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBFVk1TdGFuZGFyZFR4LCBFVk1TdGFuZGFyZFVuc2lnbmVkVHggfSBmcm9tIFwiLi4vLi4vY29tbW9uL2V2bXR4XCJcbmltcG9ydCBjcmVhdGVIYXNoIGZyb20gXCJjcmVhdGUtaGFzaFwiXG5pbXBvcnQgeyBFVk1CYXNlVHggfSBmcm9tIFwiLi9iYXNldHhcIlxuaW1wb3J0IHsgSW1wb3J0VHggfSBmcm9tIFwiLi9pbXBvcnR0eFwiXG5pbXBvcnQgeyBFeHBvcnRUeCB9IGZyb20gXCIuL2V4cG9ydHR4XCJcbmltcG9ydCB7IFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IFRyYW5zYWN0aW9uRXJyb3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBUYWtlcyBhIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIG91dHB1dCBhbmQgcmV0dXJucyB0aGUgcHJvcGVyIFtbRVZNQmFzZVR4XV0gaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHR4VHlwZUlEIFRoZSBpZCBvZiB0aGUgdHJhbnNhY3Rpb24gdHlwZVxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbRVZNQmFzZVR4XV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RUeENsYXNzID0gKHR4VHlwZUlEOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogRVZNQmFzZVR4ID0+IHtcbiAgaWYgKHR4VHlwZUlEID09PSBFVk1Db25zdGFudHMuSU1QT1JUVFgpIHtcbiAgICByZXR1cm4gbmV3IEltcG9ydFR4KC4uLmFyZ3MpXG4gIH0gZWxzZSBpZiAodHhUeXBlSUQgPT09IEVWTUNvbnN0YW50cy5FWFBPUlRUWCkge1xuICAgIHJldHVybiBuZXcgRXhwb3J0VHgoLi4uYXJncylcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0aHJvdyBuZXcgRXJyb3IoXCJUcmFuc2FjdGlvbkVycm9yIC0gU2VsZWN0VHhDbGFzczogdW5rbm93biB0eFR5cGVcIilcbn1cblxuZXhwb3J0IGNsYXNzIFVuc2lnbmVkVHggZXh0ZW5kcyBFVk1TdGFuZGFyZFVuc2lnbmVkVHg8XG4gIEtleVBhaXIsXG4gIEtleUNoYWluLFxuICBFVk1CYXNlVHhcbj4ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJVbnNpZ25lZFR4XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMudHJhbnNhY3Rpb24gPSBTZWxlY3RUeENsYXNzKGZpZWxkc1tcInRyYW5zYWN0aW9uXCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLnRyYW5zYWN0aW9uLmRlc2VyaWFsaXplKGZpZWxkc1tcInRyYW5zYWN0aW9uXCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIGdldFRyYW5zYWN0aW9uKCk6IEVWTUJhc2VUeCB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNhY3Rpb24gYXMgRVZNQmFzZVR4XG4gIH1cblxuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy5jb2RlY0lEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMikucmVhZFVJbnQxNkJFKDApXG4gICAgb2Zmc2V0ICs9IDJcbiAgICBjb25zdCB0eHR5cGU6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMudHJhbnNhY3Rpb24gPSBTZWxlY3RUeENsYXNzKHR4dHlwZSlcbiAgICByZXR1cm4gdGhpcy50cmFuc2FjdGlvbi5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gIH1cblxuICAvKipcbiAgICogU2lnbnMgdGhpcyBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQSBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICovXG4gIHNpZ24oa2M6IEtleUNoYWluKTogVHgge1xuICAgIGNvbnN0IHR4YnVmZjogQnVmZmVyID0gdGhpcy50b0J1ZmZlcigpXG4gICAgY29uc3QgbXNnOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcbiAgICAgIGNyZWF0ZUhhc2goXCJzaGEyNTZcIikudXBkYXRlKHR4YnVmZikuZGlnZXN0KClcbiAgICApXG4gICAgY29uc3Qgc2lnczogQ3JlZGVudGlhbFtdID0gdGhpcy50cmFuc2FjdGlvbi5zaWduKG1zZywga2MpXG4gICAgcmV0dXJuIG5ldyBUeCh0aGlzLCBzaWdzKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUeCBleHRlbmRzIEVWTVN0YW5kYXJkVHg8S2V5UGFpciwgS2V5Q2hhaW4sIFVuc2lnbmVkVHg+IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGlzIGluaGVyaXRlZFxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy51bnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKVxuICAgIHRoaXMudW5zaWduZWRUeC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJ1bnNpZ25lZFR4XCJdLCBlbmNvZGluZylcbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgZmllbGRzW1wiY3JlZGVudGlhbHNcIl0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoXG4gICAgICAgIGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdW2Ake2l9YF1bXCJfdHlwZUlEXCJdXG4gICAgICApXG4gICAgICBjcmVkLmRlc2VyaWFsaXplKGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdW2Ake2l9YF0sIGVuY29kaW5nKVxuICAgICAgdGhpcy5jcmVkZW50aWFscy5wdXNoKGNyZWQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW1R4XV0sIHBhcnNlcyBpdCxcbiAgICogcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgVHggaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tUeF1dXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgYnl0ZXMgdG8gYmVnaW4gcGFyc2luZ1xuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tUeF1dXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy51bnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKVxuICAgIG9mZnNldCA9IHRoaXMudW5zaWduZWRUeC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgY29uc3QgbnVtY3JlZHM6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBudW1jcmVkczsgaSsrKSB7XG4gICAgICBjb25zdCBjcmVkaWQ6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgICAucmVhZFVJbnQzMkJFKDApXG4gICAgICBvZmZzZXQgKz0gNFxuICAgICAgY29uc3QgY3JlZDogQ3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyhjcmVkaWQpXG4gICAgICBvZmZzZXQgPSBjcmVkLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMucHVzaChjcmVkKVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cbn1cbiJdfQ==