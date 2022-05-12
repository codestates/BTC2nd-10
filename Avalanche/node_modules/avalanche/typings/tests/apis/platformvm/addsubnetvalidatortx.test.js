"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bintools_1 = __importDefault(require("../../../src/utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const platformvm_1 = require("src/apis/platformvm");
const utils_1 = require("src/utils");
describe("AddSubnetValidatorTx", () => {
    /**
     * @ignore
     */
    const bintools = bintools_1.default.getInstance();
    const networkID = 1337;
    const pChainBlockchainID = "11111111111111111111111111111111LpoYY";
    const memoStr = "from snowflake to avalanche";
    const memo = buffer_1.Buffer.from(memoStr, "utf8");
    const bID = bintools.cb58Decode(pChainBlockchainID);
    const nodeID = "NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg";
    const nodeIDBuf = (0, utils_1.NodeIDStringToBuffer)(nodeID);
    const startTime = new bn_js_1.default(1647654984);
    const endTime = new bn_js_1.default(1648950865);
    const weight = new bn_js_1.default(20);
    const subnetIDStr = "WYziRrZeZVftQ56QizLxmSfwofLyJM8u3uYbRHA1Yc7YtMmbN";
    const subnetID = bintools.cb58Decode(subnetIDStr);
    const addressIndex = buffer_1.Buffer.alloc(4);
    addressIndex.writeUIntBE(0x0, 0, 4);
    const subnetAuth = new platformvm_1.SubnetAuth([addressIndex]);
    const addSubnetValidatorTx = new platformvm_1.AddSubnetValidatorTx(networkID, bID, [], [], memo, nodeIDBuf, startTime, endTime, weight, subnetID, subnetAuth);
    test("getNodeID", () => __awaiter(void 0, void 0, void 0, function* () {
        const nodeIDBuf = addSubnetValidatorTx.getNodeID();
        const nID = (0, utils_1.bufferToNodeIDString)(nodeIDBuf);
        expect(nID).toBe(nodeID);
    }));
    test("getStartTime", () => __awaiter(void 0, void 0, void 0, function* () {
        const st = addSubnetValidatorTx.getStartTime();
        expect(startTime.toString()).toBe(st.toString());
    }));
    test("getEndTime", () => __awaiter(void 0, void 0, void 0, function* () {
        const et = addSubnetValidatorTx.getEndTime();
        expect(endTime.toString()).toBe(et.toString());
    }));
    test("getWeight", () => __awaiter(void 0, void 0, void 0, function* () {
        const w = addSubnetValidatorTx.getWeight();
        expect(weight.toString()).toBe(w.toString());
    }));
    test("getSubnetID", () => __awaiter(void 0, void 0, void 0, function* () {
        const sID = addSubnetValidatorTx.getSubnetID();
        expect(subnetIDStr).toBe(sID);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkc3VibmV0dmFsaWRhdG9ydHgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvcGxhdGZvcm12bS9hZGRzdWJuZXR2YWxpZGF0b3J0eC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkVBQWtEO0FBQ2xELGtEQUFzQjtBQUN0QixvQ0FBZ0M7QUFDaEMsb0RBQXNFO0FBQ3RFLHFDQUFzRTtBQUV0RSxRQUFRLENBQUMsc0JBQXNCLEVBQUUsR0FBUyxFQUFFO0lBQzFDOztPQUVHO0lBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUVqRCxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUE7SUFDOUIsTUFBTSxrQkFBa0IsR0FBVyx1Q0FBdUMsQ0FBQTtJQUMxRSxNQUFNLE9BQU8sR0FBVyw2QkFBNkIsQ0FBQTtJQUNyRCxNQUFNLElBQUksR0FBVyxlQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUVqRCxNQUFNLEdBQUcsR0FBVyxRQUFRLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUE7SUFFM0QsTUFBTSxNQUFNLEdBQVcsMENBQTBDLENBQUE7SUFDakUsTUFBTSxTQUFTLEdBQVcsSUFBQSw0QkFBb0IsRUFBQyxNQUFNLENBQUMsQ0FBQTtJQUN0RCxNQUFNLFNBQVMsR0FBTyxJQUFJLGVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUN4QyxNQUFNLE9BQU8sR0FBTyxJQUFJLGVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUN0QyxNQUFNLE1BQU0sR0FBTyxJQUFJLGVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUU3QixNQUFNLFdBQVcsR0FDZixtREFBbUQsQ0FBQTtJQUNyRCxNQUFNLFFBQVEsR0FBb0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNsRSxNQUFNLFlBQVksR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzVDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNuQyxNQUFNLFVBQVUsR0FBZSxJQUFJLHVCQUFVLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBO0lBRTdELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxpQ0FBb0IsQ0FDbkQsU0FBUyxFQUNULEdBQUcsRUFDSCxFQUFFLEVBQ0YsRUFBRSxFQUNGLElBQUksRUFDSixTQUFTLEVBQ1QsU0FBUyxFQUNULE9BQU8sRUFDUCxNQUFNLEVBQ04sUUFBUSxFQUNSLFVBQVUsQ0FDWCxDQUFBO0lBQ0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUF3QixFQUFFO1FBQzFDLE1BQU0sU0FBUyxHQUFXLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzFELE1BQU0sR0FBRyxHQUFXLElBQUEsNEJBQW9CLEVBQUMsU0FBUyxDQUFDLENBQUE7UUFDbkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUMxQixDQUFDLENBQUEsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUF3QixFQUFFO1FBQzdDLE1BQU0sRUFBRSxHQUFPLG9CQUFvQixDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ2xELE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7SUFDbEQsQ0FBQyxDQUFBLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBd0IsRUFBRTtRQUMzQyxNQUFNLEVBQUUsR0FBTyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUNoRCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ2hELENBQUMsQ0FBQSxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsV0FBVyxFQUFFLEdBQXdCLEVBQUU7UUFDMUMsTUFBTSxDQUFDLEdBQU8sb0JBQW9CLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDOUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtJQUM5QyxDQUFDLENBQUEsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUF3QixFQUFFO1FBQzVDLE1BQU0sR0FBRyxHQUFXLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3RELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDL0IsQ0FBQyxDQUFBLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi8uLi9zcmMvdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgeyBBZGRTdWJuZXRWYWxpZGF0b3JUeCwgU3VibmV0QXV0aCB9IGZyb20gXCJzcmMvYXBpcy9wbGF0Zm9ybXZtXCJcbmltcG9ydCB7IGJ1ZmZlclRvTm9kZUlEU3RyaW5nLCBOb2RlSURTdHJpbmdUb0J1ZmZlciB9IGZyb20gXCJzcmMvdXRpbHNcIlxuXG5kZXNjcmliZShcIkFkZFN1Ym5ldFZhbGlkYXRvclR4XCIsICgpOiB2b2lkID0+IHtcbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIGNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcblxuICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IDEzMzdcbiAgY29uc3QgcENoYWluQmxvY2tjaGFpbklEOiBzdHJpbmcgPSBcIjExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExTHBvWVlcIlxuICBjb25zdCBtZW1vU3RyOiBzdHJpbmcgPSBcImZyb20gc25vd2ZsYWtlIHRvIGF2YWxhbmNoZVwiXG4gIGNvbnN0IG1lbW86IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lbW9TdHIsIFwidXRmOFwiKVxuXG4gIGNvbnN0IGJJRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZShwQ2hhaW5CbG9ja2NoYWluSUQpXG5cbiAgY29uc3Qgbm9kZUlEOiBzdHJpbmcgPSBcIk5vZGVJRC03WGh3Mm1EeHVEUzQ0ajQyVENCNlU1NTc5ZXNiU3QzTGdcIlxuICBjb25zdCBub2RlSURCdWY6IEJ1ZmZlciA9IE5vZGVJRFN0cmluZ1RvQnVmZmVyKG5vZGVJRClcbiAgY29uc3Qgc3RhcnRUaW1lOiBCTiA9IG5ldyBCTigxNjQ3NjU0OTg0KVxuICBjb25zdCBlbmRUaW1lOiBCTiA9IG5ldyBCTigxNjQ4OTUwODY1KVxuICBjb25zdCB3ZWlnaHQ6IEJOID0gbmV3IEJOKDIwKVxuXG4gIGNvbnN0IHN1Ym5ldElEU3RyOiBzdHJpbmcgPVxuICAgIFwiV1l6aVJyWmVaVmZ0UTU2UWl6THhtU2Z3b2ZMeUpNOHUzdVliUkhBMVljN1l0TW1iTlwiXG4gIGNvbnN0IHN1Ym5ldElEOiBzdHJpbmcgfCBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKHN1Ym5ldElEU3RyKVxuICBjb25zdCBhZGRyZXNzSW5kZXg6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBhZGRyZXNzSW5kZXgud3JpdGVVSW50QkUoMHgwLCAwLCA0KVxuICBjb25zdCBzdWJuZXRBdXRoOiBTdWJuZXRBdXRoID0gbmV3IFN1Ym5ldEF1dGgoW2FkZHJlc3NJbmRleF0pXG5cbiAgY29uc3QgYWRkU3VibmV0VmFsaWRhdG9yVHggPSBuZXcgQWRkU3VibmV0VmFsaWRhdG9yVHgoXG4gICAgbmV0d29ya0lELFxuICAgIGJJRCxcbiAgICBbXSxcbiAgICBbXSxcbiAgICBtZW1vLFxuICAgIG5vZGVJREJ1ZixcbiAgICBzdGFydFRpbWUsXG4gICAgZW5kVGltZSxcbiAgICB3ZWlnaHQsXG4gICAgc3VibmV0SUQsXG4gICAgc3VibmV0QXV0aFxuICApXG4gIHRlc3QoXCJnZXROb2RlSURcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IG5vZGVJREJ1ZjogQnVmZmVyID0gYWRkU3VibmV0VmFsaWRhdG9yVHguZ2V0Tm9kZUlEKClcbiAgICBjb25zdCBuSUQ6IHN0cmluZyA9IGJ1ZmZlclRvTm9kZUlEU3RyaW5nKG5vZGVJREJ1ZilcbiAgICBleHBlY3QobklEKS50b0JlKG5vZGVJRClcbiAgfSlcblxuICB0ZXN0KFwiZ2V0U3RhcnRUaW1lXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBzdDogQk4gPSBhZGRTdWJuZXRWYWxpZGF0b3JUeC5nZXRTdGFydFRpbWUoKVxuICAgIGV4cGVjdChzdGFydFRpbWUudG9TdHJpbmcoKSkudG9CZShzdC50b1N0cmluZygpKVxuICB9KVxuXG4gIHRlc3QoXCJnZXRFbmRUaW1lXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBldDogQk4gPSBhZGRTdWJuZXRWYWxpZGF0b3JUeC5nZXRFbmRUaW1lKClcbiAgICBleHBlY3QoZW5kVGltZS50b1N0cmluZygpKS50b0JlKGV0LnRvU3RyaW5nKCkpXG4gIH0pXG5cbiAgdGVzdChcImdldFdlaWdodFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdzogQk4gPSBhZGRTdWJuZXRWYWxpZGF0b3JUeC5nZXRXZWlnaHQoKVxuICAgIGV4cGVjdCh3ZWlnaHQudG9TdHJpbmcoKSkudG9CZSh3LnRvU3RyaW5nKCkpXG4gIH0pXG5cbiAgdGVzdChcImdldFN1Ym5ldElEXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBzSUQ6IHN0cmluZyA9IGFkZFN1Ym5ldFZhbGlkYXRvclR4LmdldFN1Ym5ldElEKClcbiAgICBleHBlY3Qoc3VibmV0SURTdHIpLnRvQmUoc0lEKVxuICB9KVxufSlcbiJdfQ==