"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEditContentInfo = void 0;
const ton_core_1 = require("ton-core");
const EligibleInternalTx_1 = require("../utils/EligibleInternalTx");
function extractEditContentInfo(body) {
    var _a, _b, _c;
    return {
        queryId: body === null || body === void 0 ? void 0 : body.loadUint(64),
        from: (_a = body.inMessage) === null || _a === void 0 ? void 0 : _a.info.src,
        nftItem: (_b = body.inMessage) === null || _b === void 0 ? void 0 : _b.info.dest,
        payload: body === null || body === void 0 ? void 0 : body.loadRef(),
        value: (_c = body.inMessage) === null || _c === void 0 ? void 0 : _c.info.value.coins,
    };
}
function parseEditContentInfo(transaction) {
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
        return extractEditContentInfo(body);
    }
    return null;
}
exports.parseEditContentInfo = parseEditContentInfo;
//# sourceMappingURL=EditContent.js.map