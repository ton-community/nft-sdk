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
exports.NftCollectionCodeCell = exports.NftCollectionCodeBoc = exports.buildNftCollectionDataCell = exports.NftCollection = exports.OperationCodes = void 0;
const ton_core_1 = require("ton-core");
const OffchainContent_1 = require("../../types/OffchainContent");
exports.OperationCodes = {
    Mint: 1,
    BatchMint: 2,
    ChangeOwner: 3,
    EditContent: 4,
    GetRoyaltyParams: 0x693d3950,
    GetRoyaltyParamsResponse: 0xa8cb00ad
};
class NftCollection {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftCollection(address);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildNftCollectionDataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.NftCollectionCodeCell,
                data: data
            });
            return new NftCollection(address, 0, {
                code: exports.NftCollectionCodeCell,
                data: data
            });
        });
    }
    // Deployment
    sendDeploy(provider, via, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value,
                body: (0, ton_core_1.beginCell)().endCell(),
            });
        });
    }
    sendMint(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let itemContent = (0, ton_core_1.beginCell)();
            // itemContent.bits.writeString(params.itemContent)
            itemContent.storeBuffer(Buffer.from(params.itemContent)).endCell();
            let nftItemMessage = (0, ton_core_1.beginCell)();
            nftItemMessage.storeAddress(params.itemOwnerAddress);
            nftItemMessage.storeRef(itemContent).endCell();
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(1, 32)
                    .storeUint(params.queryId || 0, 64)
                    .storeUint(params.itemIndex, 64)
                    .storeCoins(params.passAmount)
                    .storeRef(nftItemMessage)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendChangeOwner(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(exports.OperationCodes.ChangeOwner, 32)
                    .storeUint(params.queryId || 0, 64)
                    .storeAddress(params.newOwner)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY
            });
        });
    }
    sendRoyaltyParams(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(exports.OperationCodes.GetRoyaltyParams, 32)
                    .storeUint(params.queryId || 0, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY
            });
        });
    }
    // const { stack } = await provider.get('get_nft_address_by_index', [
    //     { type: 'int', value: index }
    // ])
    getCollectionData(provider, nextItemIndex, collectionContent, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_collection_data', [
                { type: 'int', value: nextItemIndex },
                { type: 'cell', cell: collectionContent },
                { type: 'slice', cell: ownerAddress.asCell() }
            ]);
            return {
                next_item_index: stack.readBigNumber(),
                collectionContent: stack.readCellOpt(),
                owner_address: stack.readAddressOpt(),
            };
        });
    }
    getNftAddressByIndex(provider, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_nft_address_by_index', [
                { type: 'int', value: index }
            ]);
            return {
                nftAddress: stack.readAddressOpt(),
            };
        });
    }
    getNftContent(provider, index, individualContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_nft_content', [
                { type: 'int', value: index },
                { type: 'cell', cell: individualContent }
            ]);
            return {
                fullContent: stack.readCellOpt(),
            };
        });
    }
}
exports.NftCollection = NftCollection;
// default#_ royalty_factor:uint16 royalty_base:uint16 royalty_address:MsgAddress = RoyaltyParams;
// storage#_ owner_address:MsgAddress next_item_index:uint64
//           ^[collection_content:^Cell common_content:^Cell]
//           nft_item_code:^Cell
//           royalty_params:^RoyaltyParams
//           = Storage;
function buildNftCollectionDataCell(data) {
    let dataCell = (0, ton_core_1.beginCell)();
    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeUint(data.nextItemIndex, 64);
    let contentCell = (0, ton_core_1.beginCell)();
    let collectionContent = (0, OffchainContent_1.encodeOffChainContent)(data.collectionContent);
    let commonContent = (0, ton_core_1.beginCell)();
    commonContent.storeBuffer(Buffer.from(data.commonContent));
    // commonContent.bits.writeString(data.commonContent)
    contentCell.storeRef(collectionContent);
    contentCell.storeRef(commonContent);
    dataCell.storeRef(contentCell);
    dataCell.storeRef(data.nftItemCode);
    let royaltyCell = (0, ton_core_1.beginCell)();
    royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16);
    royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16);
    royaltyCell.storeAddress(data.royaltyParams.royaltyAddress);
    dataCell.storeRef(royaltyCell);
    return dataCell.endCell();
}
exports.buildNftCollectionDataCell = buildNftCollectionDataCell;
// Data
exports.NftCollectionCodeBoc = 'te6cckECFAEAAh8AART/APSkE/S88sgLAQIBYgkCAgEgBAMAJbyC32omh9IGmf6mpqGC3oahgsQCASAIBQIBIAcGAC209H2omh9IGmf6mpqGAovgngCOAD4AsAAvtdr9qJofSBpn+pqahg2IOhph+mH/SAYQAEO4tdMe1E0PpA0z/U1NQwECRfBNDUMdQw0HHIywcBzxbMyYAgLNDwoCASAMCwA9Ra8ARwIfAFd4AYyMsFWM8WUAT6AhPLaxLMzMlx+wCAIBIA4NABs+QB0yMsCEsoHy//J0IAAtAHIyz/4KM8WyXAgyMsBE/QA9ADLAMmAE59EGOASK3wAOhpgYC42Eit8H0gGADpj+mf9qJofSBpn+pqahhBCDSenKgpQF1HFBuvgoDoQQhUZYBWuEAIZGWCqALnixJ9AQpltQnlj+WfgOeLZMAgfYBwGyi544L5cMiS4ADxgRLgAXGBEuAB8YEYGYHgAkExIREAA8jhXU1DAQNEEwyFAFzxYTyz/MzMzJ7VTgXwSED/LwACwyNAH6QDBBRMhQBc8WE8s/zMzMye1UAKY1cAPUMI43gED0lm+lII4pBqQggQD6vpPywY/egQGTIaBTJbvy9AL6ANQwIlRLMPAGI7qTAqQC3gSSbCHis+YwMlBEQxPIUAXPFhPLP8zMzMntVABgNQLTP1MTu/LhklMTugH6ANQwKBA0WfAGjhIBpENDyFAFzxYTyz/MzMzJ7VSSXwXiN0CayQ==';
exports.NftCollectionCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftCollectionCodeBoc, 'base64'))[0];
//# sourceMappingURL=NftCollection.js.map