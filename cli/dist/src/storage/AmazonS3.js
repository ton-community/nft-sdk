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
class AmazonS3 {
    constructor(accessKeyId, secretAccessKey) {
        this.s3 = new aws_sdk_1.S3({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        });
    }
    // Function to upload images in bulk to Amazon S3
    uploadBulk(assetsFolderPath, s3BucketName = "nft-collection", options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the S3 bucket exists, create it if it doesn't exist
                const bucketExists = yield this.s3.headBucket({ Bucket: s3BucketName }).promise().then(() => true).catch(() => false);
                if (!bucketExists) {
                    yield this.createBucket(s3BucketName);
                }
                // Read the directory
                const files = fs_1.default.readdirSync(assetsFolderPath);
                // Filter and sort image files
                const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)).sort((a, b) => parseInt(a) - parseInt(b));
                // Process image uploads in ascending order and collect their URLs
                const imageUrls = [];
                for (const imageFile of imageFiles) {
                    // Read image file
                    const imagePath = path_1.default.join(assetsFolderPath, imageFile);
                    const imageData = fs_1.default.readFileSync(imagePath);
                    // Prepare S3 upload parameters
                    const params = {
                        Bucket: s3BucketName,
                        Key: imageFile,
                        Body: imageData,
                        ContentType: (_a = options === null || options === void 0 ? void 0 : options.type) !== null && _a !== void 0 ? _a : 'image/jpeg', // Adjust this if you are handling multiple image formats
                    };
                    // Upload the image to S3
                    yield this.s3.upload(params).promise();
                    // Add the image URL to the array
                    imageUrls.push(`https://${s3BucketName}.s3.amazonaws.com/${imageFile}`);
                    // Read the JSON file with the same filename as the image
                    const jsonFilePath = path_1.default.join(assetsFolderPath, `${path_1.default.parse(imageFile).name}.json`);
                    if (fs_1.default.existsSync(jsonFilePath)) {
                        // Read the JSON file
                        const jsonFile = fs_1.default.readFileSync(jsonFilePath, 'utf8');
                        const jsonData = JSON.parse(jsonFile);
                        // Upload the JSON file to S3
                        const jsonParams = {
                            Bucket: s3BucketName,
                            Key: `${path_1.default.parse(imageFile).name}.json`,
                            Body: jsonData,
                            ContentType: 'application/json',
                        };
                        yield this.s3.upload(jsonParams).promise();
                    }
                    else {
                        (0, console_1.error)('Metadata not found for', path_1.default.parse(imageFile).name);
                    }
                }
                console.log('All images uploaded successfully!');
                return imageUrls;
            }
            catch (error) {
                console.error('Error uploading images to S3:', error);
                throw error;
            }
        });
    }
    createBucket(bucketName, locationConstraint) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                CreateBucketConfiguration: {
                    // Set your region here
                    LocationConstraint: !locationConstraint ? "eu-west-1" : locationConstraint
                }
            };
            this.s3.createBucket(params, (err, data) => {
                if (err)
                    console.log(err, err.stack);
                else
                    console.log('Bucket Created Successfully', data.Location);
                return data.Location;
            });
        });
    }
    uploadFile(bucketName, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Key: file.name,
                Body: file.data
            };
            this.s3.upload(params, (err, data) => {
                if (err) {
                    throw err;
                }
                console.log(`File uploaded successfully. ${data.Location}`);
                return data.Location;
            });
        });
    }
    deleteFile(bucketName, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Key: fileName
            };
            this.s3.deleteObject(params, (err, data) => {
                if (err) {
                    throw err;
                }
                console.log('File deleted successfully');
            });
        });
    }
    deleteBucket(bucketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName
            };
            this.s3.deleteBucket(params, (err, data) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket deleted successfully');
            });
        });
    }
    createBucketAndUpload(bucketName, file, locationConstraint) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                CreateBucketConfiguration: {
                    // Set your region here
                    LocationConstraint: !locationConstraint ? "eu-west-1" : locationConstraint
                }
            };
            this.s3.createBucket(params, (err, data) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket Created Successfully', data.Location);
                return data.Location;
            });
            return this.uploadFile(bucketName, file);
        });
    }
    createAndUploadMetadata(bucketName, name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Key: `${name}.json`,
                Body: data,
                ContentType: 'application/json'
            };
            this.s3.upload(params, (err, data) => {
                if (err) {
                    throw err;
                }
                console.log(`File uploaded successfully. ${data.Location}`);
                return data.Location;
            });
        });
    }
    listBuckets() {
        return __awaiter(this, void 0, void 0, function* () {
            this.s3.listBuckets((err, data) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket List', data.Buckets);
                return data.Buckets;
            });
        });
    }
    listObjects(bucketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName
            };
            this.s3.listObjects(params, (err, data) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket Objects', data.Contents);
                return data.Contents;
            });
        });
    }
    getObject(bucketName, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Key: fileName
            };
            this.s3.getObject(params, (err, data) => {
                var _a, _b;
                if (err) {
                    throw err;
                }
                console.log('Bucket Object', (_a = data.Body) === null || _a === void 0 ? void 0 : _a.toString());
                return (_b = data.Body) === null || _b === void 0 ? void 0 : _b.toString();
            });
        });
    }
    getSignedUrl(bucketName, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Key: fileName,
                Expires: 60
            };
            this.s3.getSignedUrl('getObject', params, (err, url) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket Object', url);
                return url;
            });
        });
    }
    getSignedUrlPutObject(bucketName, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Key: fileName,
                Expires: 60
            };
            this.s3.getSignedUrl('putObject', params, (err, url) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket Object', url);
                return url;
            });
        });
    }
    getSignedUrlDeleteObject(bucketName, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Key: fileName,
                Expires: 60
            };
            this.s3.getSignedUrl('deleteObject', params, (err, url) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket Object', url);
            });
        });
    }
    getSignedUrlDeleteBucket(bucketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Bucket: bucketName,
                Expires: 60
            };
            this.s3.getSignedUrl('deleteBucket', params, (err, url) => {
                if (err) {
                    throw err;
                }
                console.log('Bucket Object', url);
                return url;
            });
        });
    }
}
exports.AmazonS3 = AmazonS3;
//# sourceMappingURL=AmazonS3.js.map