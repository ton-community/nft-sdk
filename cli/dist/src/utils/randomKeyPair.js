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
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomKeyPair = void 0;
const ton_crypto_1 = require("ton-crypto");
function randomKeyPair() {
    return __awaiter(this, void 0, void 0, function* () {
        let mnemonics = yield (0, ton_crypto_1.mnemonicNew)();
        return (0, ton_crypto_1.mnemonicToPrivateKey)(mnemonics);
    });
}
exports.randomKeyPair = randomKeyPair;
//# sourceMappingURL=randomKeyPair.js.map