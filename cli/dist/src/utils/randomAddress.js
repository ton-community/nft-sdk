"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomAddress = void 0;
const ton_core_1 = require("ton-core");
const crypto_1 = require("crypto");
function randomAddress() {
    return new ton_core_1.Address(0, (0, crypto_1.pseudoRandomBytes)(256 / 8));
}
exports.randomAddress = randomAddress;
//# sourceMappingURL=randomAddress.js.map