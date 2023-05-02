"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTransferEditorshipInfo = void 0;
const ton_core_1 = require("ton-core");
const EligibleInternalTx_1 = require("../utils/EligibleInternalTx");
function extractTransferEditorshipInfo(body) {
    return {
        queryId: body === null || body === void 0 ? void 0 : body.loadUint(64),
        from: body === null || body === void 0 ? void 0 : body.info.src,
        nftItem: body === null || body === void 0 ? void 0 : body.info.dest,
        newEditor: body === null || body === void 0 ? void 0 : body.loadAddress(),
        responseDestination: body === null || body === void 0 ? void 0 : body.loadAddress(),
        customPayload: body === null || body === void 0 ? void 0 : body.loadMaybeRef(),
        forwardAmount: body === null || body === void 0 ? void 0 : body.loadCoins(),
        forwardPayload: body === null || body === void 0 ? void 0 : body.loadMaybeRef(),
        value: body === null || body === void 0 ? void 0 : body.info.value.coins,
    };
}
function parseTransferEditorshipInfo(transaction) {
    var _a;
    const tx = (0, ton_core_1.loadTransaction)(transaction);
    const body = (_a = tx.inMessage) === null || _a === void 0 ? void 0 : _a.body.beginParse();
    let op;
    try {
        op = body === null || body === void 0 ? void 0 : body.loadUint(32);
    }
    catch (_b) {
        return null;
    }
    if ((0, EligibleInternalTx_1.isEligibleTransaction)(tx)) {
        return extractTransferEditorshipInfo(body);
    }
    return null;
}
exports.parseTransferEditorshipInfo = parseTransferEditorshipInfo;
//# sourceMappingURL=TransferEditorship.js.map