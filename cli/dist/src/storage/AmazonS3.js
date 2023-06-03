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
exports.AmazonS3 = void 0;
const aws_sdk_1 = require("aws-sdk");
const console_1 = require("console");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * AmazonS3 is a class that provides utility functions for interacting with Amazon S3.
 */
class AmazonS3 {
    /**
     * Creates an instance of the AmazonS3 class.
     * @param accessKeyId - The access key ID for your AWS account.
     * @param secretAccessKey - The secret access key for your AWS account.
     */
    constructor(accessKeyId, secretAccessKey, bucketName) {
        this.bucketName = bucketName;
        this.s3 = new aws_sdk_1.S3({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        });
    }
    /**
     * Uploads an image file to an S3 bucket.
     * @param imagePath - The path to the image file to be uploaded.
     * @returns A Promise that resolves to the URL of the uploaded image.
     */
    uploadImage(imagePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContent = fs_1.default.readFileSync(imagePath);
            const params = {
                Bucket: this.bucketName,
                Key: path_1.default.basename(imagePath),
                Body: fileContent,
                ContentType: 'image/jpeg', // adjust as needed
            };
            yield this.s3.upload(params).promise();
            return `https://${this.bucketName}.s3.amazonaws.com/${params.Key}`;
        });
    }
    /**
     * Uploads multiple image files from a folder to an S3 bucket.
     * @param folderPath - The path to the folder containing the image files.
     * @returns A Promise that resolves to an array of URLs of the uploaded images.
     */
    uploadImages(folderPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = fs_1.default.readdirSync(folderPath);
            const uploadPromises = files.map(file => this.uploadImage(path_1.default.join(folderPath, file)));
            return Promise.all(uploadPromises);
        });
    }
    /**
     * Uploads a JSON file to an S3 bucket.
     * @param jsonPath - The path to the JSON file to be uploaded.
     * @returns A Promise that resolves to the URL of the uploaded JSON file.
     */
    uploadJson(jsonPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContent = fs_1.default.readFileSync(jsonPath);
            const params = {
                Bucket: this.bucketName,
                Key: path_1.default.basename(jsonPath),
                Body: fileContent,
                ContentType: 'application/json', // JSON file mimetype
            };
            yield this.s3.upload(params).promise();
            return `https://${this.bucketName}.s3.amazonaws.com/${params.Key}`;
        });
    }
    /**
     * Uploads multiple JSON files from a folder to an S3 bucket.
     * @param folderPath - The path to the folder containing the JSON files.
     * @returns A Promise that resolves to an array of URLs of the uploaded JSON files.
     */
    uploadJsonBulk(folderPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = fs_1.default.readdirSync(folderPath);
            const uploadPromises = files.map(file => this.uploadJson(path_1.default.join(folderPath, file)));
            return Promise.all(uploadPromises);
        });
    }
    /**
     * Uploads images in bulk to IPFS using Pinata SDK in ascending order of file names and returns their URLs.
     * @param assetsFolderPath - The path to the folder containing the image and JSON files.
     * @returns A Promise that resolves to an array of two arrays:
     * - The first array contains the URLs of the uploaded images on IPFS.
     * - The second array contains the URLs of the uploaded JSON files on IPFS.
     */
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
                    // Upload the image to S3
                    const imageUrl = yield this.uploadImage(imagePath);
                    imageUrls.push(imageUrl);
                    // Read the JSON file with the same filename as the image
                    const jsonFilePath = path_1.default.join(assetsFolderPath, `${path_1.default.parse(imageFile).name}.json`);
                    if (fs_1.default.existsSync(jsonFilePath)) {
                        // Upload the JSON file to S3
                        const jsonUrl = yield this.uploadJson(jsonFilePath);
                        jsonUrls.push(jsonUrl);
                        console.log(`JSON file uploaded to S3: ${jsonUrl}`);
                    }
                    else {
                        (0, console_1.error)('Metadata not found for', path_1.default.parse(imageFile).name);
                    }
                }
                console.log('All images uploaded successfully!');
                return [imageUrls, jsonUrls];
            }
            catch (error) {
                console.error('Error uploading images to S3:', error);
                throw error;
            }
        });
    }
}
exports.AmazonS3 = AmazonS3;
//# sourceMappingURL=AmazonS3.js.map