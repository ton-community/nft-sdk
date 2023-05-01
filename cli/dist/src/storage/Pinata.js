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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pinata = void 0;
const sdk_1 = __importDefault(require("@pinata/sdk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Pinata - For IPFS Integration
class Pinata {
    constructor(apiKey, secretApiKey) {
        this.pinata = new sdk_1.default(apiKey, secretApiKey);
    }
    // Function to upload images in bulk to IPFS using Pinata SDK in ascending order of file names and return their URLs
    uploadImagesBulk(assetsFolderPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the directory
                const files = fs_1.default.readdirSync(assetsFolderPath);
                // Filter and sort image files
                const imageFiles = files
                    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
                    .sort((a, b) => parseInt(a) - parseInt(b));
                // Process image uploads in ascending order and collect their URLs
                const imageUrls = [];
                for (const imageFile of imageFiles) {
                    // Read image file
                    const imagePath = path_1.default.join(assetsFolderPath, imageFile);
                    const imageData = fs_1.default.createReadStream(imagePath);
                    // Upload the image to IPFS using Pinata SDK
                    const result = yield this.pinata.pinFileToIPFS(imageData, {
                        pinataMetadata: {
                            name: imageFile
                        }
                    });
                    // Add the image URL to the array
                    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
                    imageUrls.push(ipfsUrl);
                }
                console.log('All images uploaded successfully!');
                return imageUrls;
            }
            catch (error) {
                console.error('Error uploading images to IPFS:', error);
                throw error;
            }
        });
    }
    pinByHash(hashToPin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pinata.pinByHash(hashToPin);
        });
    }
    pinFileToIPFS(readableStream) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pinata.pinFileToIPFS(readableStream);
        });
    }
    pinFromFS(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pinata.pinFromFS(path);
        });
    }
    pinJSONToIPFS(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pinata.pinJSONToIPFS(body);
        });
    }
    pinJobs() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pinata.pinJobs();
        });
    }
    unpin(hashToUnpin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pinata.unpin(hashToUnpin);
        });
    }
}
exports.Pinata = Pinata;
//# sourceMappingURL=Pinata.js.map