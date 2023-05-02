"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTransactionData = void 0;
const ton_core_1 = require("ton-core");
function parseTransactionData(transaction) {
    var _a;
    const tx = (0, ton_core_1.loadTransaction)(transaction);
    if (((_a = tx.inMessage) === null || _a === void 0 ? void 0 : _a.info.type) === "internal") {
        const body = tx.inMessage.body.beginParse();
        let op;
        try {
            op = body.loadUint(32);
            console.log(op);
        }
        catch (_b) {
            return {
                type: "unknown",
                info: null,
            };
        }
        if (op === 0x5fcc3d14 &&
            tx.description.type === "generic" &&
            tx.description.computePhase.type === "vm") {
            const nftTransfer = {
                queryId: body.loadUint(64),
                from: tx.inMessage.info.src,
                to: body.loadAddress(),
                value: tx.inMessage.info.value.coins,
                responseTo: body.loadAddress(),
                customPayload: body.loadMaybeRef(),
                forwardAmount: body.loadCoins(),
                forwardPayload: body.loadMaybeRef(),
            };
            return {
                type: "transfer",
                info: nftTransfer,
            };
        }
        else if (op === 0x693d3950 &&
            tx.description.type === "generic" &&
            tx.description.computePhase.type === "vm") {
            const royaltyInfo = {
                queryId: body.loadUint(64),
                from: tx.inMessage.info.src,
                nftItem: body.loadAddress(),
                value: tx.inMessage.info.value.coins,
            };
            return {
                type: "royalty_params",
                info: royaltyInfo,
            };
        }
        else {
            return {
                type: "unknown",
                info: null
            };
        }
    }
    return {
        type: null,
        info: null,
    };
}
exports.parseTransactionData = parseTransactionData;
//# sourceMappingURL=parseTransaction.js.map