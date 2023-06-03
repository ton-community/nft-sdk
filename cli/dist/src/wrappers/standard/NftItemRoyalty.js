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
exports.NftItemRoyalty = void 0;
const ton_core_1 = require("ton-core");
const NftItem_1 = require("./NftItem");
/**
 * Represents an NFT item contract with royalty features.
 * Inherits from the NftItem class.
 */
class NftItemRoyalty extends NftItem_1.NftItem {
    /**
     * Constructs an instance of the NftItemRoyalty contract from an address.
     * @param address - The address of the contract.
     * @returns An instance of NftItemRoyalty.
     */
    static createFromAddress(address) {
        return new NftItemRoyalty(address);
    }
    /**
     * Sends a request to get the royalty parameters from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @param via - The Sender initiating the data retrieval.
     * @param params - The parameters for the data retrieval.
     */
    sendGetRoyaltyParams(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x693d3950, 32)
                    .storeUint(params.queryId, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    /**
     * Retrieves the royalty parameters of the NFT from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @returns An object with the royalty parameters.
     */
    getRoyaltyParams(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('royalty_params', []);
            return {
                init: stack.readBoolean(),
                numerator: stack.readBigNumber(),
                denominator: stack.readBigNumber(),
                destination: stack.readAddressOpt()
            };
        });
    }
}
exports.NftItemRoyalty = NftItemRoyalty;
//# sourceMappingURL=NftItemRoyalty.js.map