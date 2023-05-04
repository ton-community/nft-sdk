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
const console_1 = require("console");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Pinata - For IPFS Integration
class Pinata {
    constructor(apiKey, secretApiKey) {
        this.pinata = new sdk_1.default(apiKey, secretApiKey);
    }
    // Function to upload images in bulk to IPFS using Pinata SDK in ascending order of file names and return their URLs
    uploadBulk(assetsFolderPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the directory
                const files = fs_1.default.readdirSync(assetsFolderPath);
                // Filter and sort image files
                const imageFiles = files
                    .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
                    .sort((a, b) => parseInt(a) - parseInt(b));
                // Process image uploads in ascending order and collect their URLs
                const imageUrls = [];
                const jsonUrls = [];
                for (const imageFile of imageFiles) {
                    // Read image file
                    const imagePath = path_1.default.join(assetsFolderPath, imageFile);
                    const imageData = fs_1.default.createReadStream(imagePath);
                    // Upload the image to IPFS using Pinata SDK
                    const result = yield this.pinata.pinFileToIPFS(imageData, {
                        pinataMetadata: {
                            name: imageFile,
                        },
                    });
                    // Add the image URL to the array
                    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
                    imageUrls.push(ipfsUrl);
                    // Read the JSON file with the same filename as the image
                    const jsonFilePath = path_1.default.join(assetsFolderPath, `${path_1.default.parse(imageFile).name}.json`);
                    if (fs_1.default.existsSync(jsonFilePath)) {
                        const jsonFile = fs_1.default.readFileSync(jsonFilePath, 'utf8');
                        const jsonData = JSON.parse(jsonFile);
                        // Add the IPFS URL to the JSON data
                        jsonData.image = ipfsUrl;
                        // Write the updated JSON data to the file
                        fs_1.default.writeFileSync(jsonFilePath, JSON.stringify(jsonData));
                        // Upload the JSON file to IPFS using Pinata SDK
                        const jsonFileData = fs_1.default.createReadStream(jsonFilePath);
                        const jsonResult = yield this.pinata.pinFileToIPFS(jsonFileData, {
                            pinataMetadata: {
                                name: `${path_1.default.parse(imageFile).name}.json`,
                            },
                        });
                        const jsonUrl = `https://gateway.pinata.cloud/ipfs/${jsonResult.IpfsHash}`;
                        jsonUrls.push(jsonUrl);
                        console.log(`JSON file uploaded to IPFS: ${jsonUrl}`);
                    }
                    else {
                        (0, console_1.error)("Metadata not found for", path_1.default.parse(imageFile).name);
                    }
                }
                console.log('All images uploaded successfully!');
                return [imageUrls, jsonUrls];
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