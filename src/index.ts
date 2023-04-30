import {AmazonS3} from "./storage/AmazonS3";
import {Pinata} from "./storage/Pinata";

export * from "./wrappers/getgems/NftCollection";
export * from "./wrappers/getgems/NftItem";
export * from "./wrappers/getgems/SbtSingle";
export * from "./wrappers/standard/NftItemRoyalty";
export * from "./wrappers/getgems/NftAuction";
export * from "./wrappers/getgems/NftAuctionV2";
export * from "./wrappers/getgems/NftFixedPrice";
export * from "./wrappers/getgems/NftFixedPriceV2";
export * from "./wrappers/getgems/NftFixedPriceV3";
export * from "./wrappers/getgems/NftMarketplace";
export * from "./wrappers/getgems/NftOffer";
export * from "./wrappers/getgems/NftSwap";

export {
    AmazonS3, 
    Pinata
};