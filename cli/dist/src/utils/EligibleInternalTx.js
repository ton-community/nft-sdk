"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEligibleTransaction = void 0;
function isEligibleTransaction(tx) {
    var _a;
    return (((_a = tx.inMessage) === null || _a === void 0 ? void 0 : _a.info.type) == 'internal' &&
        tx.description.type == 'generic' &&
        tx.description.computePhase.type == 'vm' &&
        tx.description.computePhase.exitCode == 0);
}
exports.isEligibleTransaction = isEligibleTransaction;
//# sourceMappingURL=EligibleInternalTx.js.map