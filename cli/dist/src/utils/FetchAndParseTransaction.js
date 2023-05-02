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
exports.fetchAndParseTransactionData = void 0;
const ton_core_1 = require("ton-core");
const ton_api_1 = require("../ton-api");
const parseTransaction_1 = require("./parseTransaction");
function fetchAndParseTransactionData(account, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const tonApi = new ton_api_1.TonAPI();
        const transactions = yield tonApi.getTransactionsByAddress(account, limit);
        let transactions_data = [];
        for (let i = 0; i < transactions.transactions.length; i++) {
            const transaction = transactions.transactions[i];
            const parsedTransaction = yield (0, parseTransaction_1.parseTransactionData)(ton_core_1.Cell.fromBoc(Buffer.from(transaction.data, 'hex'))[0].beginParse());
            transactions_data.push(parsedTransaction);
        }
        return transactions_data;
    });
}
exports.fetchAndParseTransactionData = fetchAndParseTransactionData;
//# sourceMappingURL=FetchAndParseTransaction.js.map