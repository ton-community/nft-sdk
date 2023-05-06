import { S3 } from 'aws-sdk';
import { error } from 'console';
import fs from 'fs';
import path from 'path';

export class AmazonS3 {
    public s3: S3;

    constructor (
        accessKeyId: string,
        secretAccessKey: string
    ) {
        this.s3 = new S3(
            {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            }
        );
    }

    // Function to upload images in bulk to Amazon S3
    async uploadImagesBulk(
        assetsFolderPath: string, 
        s3BucketName: string,
        options?: {
            type: string
        }
    ): Promise<String[]> {
        try {
            // Check if the S3 bucket exists, create it if it doesn't exist
            const bucketExists = await this.s3.headBucket({ Bucket: s3BucketName }).promise().then(() => true).catch(() => false);
            if (!bucketExists) {
                await this.createBucket(s3BucketName);
            }

            // Read the directory
            const files = fs.readdirSync(assetsFolderPath);

            // Filter and sort image files
            const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)).sort((a, b) => parseInt(a) - parseInt(b));

            // Process image uploads in ascending order and collect their URLs
            const imageUrls: string[] = [];

            for (const imageFile of imageFiles) {
                // Read image file
                const imagePath = path.join(assetsFolderPath, imageFile);
                const imageData = fs.readFileSync(imagePath);

                // Prepare S3 upload parameters
                const params: AWS.S3.PutObjectRequest = {
                    Bucket: s3BucketName,
                    Key: imageFile,
                    Body: imageData,
                    ContentType: options?.type ?? 'image/jpeg', // Adjust this if you are handling multiple image formats
                };

                // Upload the image to S3
                await this.s3.upload(params).promise();

                // Add the image URL to the array
                imageUrls.push(`https://${s3BucketName}.s3.amazonaws.com/${imageFile}`);

                // Read the JSON file with the same filename as the image
                const jsonFilePath = path.join(assetsFolderPath, `${path.parse(imageFile).name}.json`);

                if (fs.existsSync(jsonFilePath)) {
                    // Read the JSON file
                    const jsonFile = fs.readFileSync(jsonFilePath, 'utf8');
                    const jsonData = JSON.parse(jsonFile);

                    // Upload the JSON file to S3
                    const jsonParams: AWS.S3.PutObjectRequest = {
                        Bucket: s3BucketName,
                        Key: `${path.parse(imageFile).name}.json`,
                        Body: jsonFile,
                        ContentType: 'application/json',
                    };
                    await this.s3.upload(jsonParams).promise();
                } else {
                    error('Metadata not found for', path.parse(imageFile).name);
                }
            }

            console.log('All images uploaded successfully!');
            return imageUrls;
        } catch (error) {
            console.error('Error uploading images to S3:', error);
            throw error;
        }
    }

    async createBucket(
        bucketName: string,
        locationConstraint?: string
    ) {
        const params = {
            Bucket: bucketName,
            CreateBucketConfiguration: {
                // Set your region here
                LocationConstraint: !locationConstraint ? "eu-west-1" : locationConstraint
            }
        };
        
        this.s3.createBucket(params, (err, data) => {
            if (err) console.log(err, err.stack);
            else console.log('Bucket Created Successfully', data.Location);

            return data.Location;
        });
    }

    async uploadFile(
        bucketName: string,
        file: any
    ) {
        const params = {
            Bucket: bucketName,
            Key: file.name,
            Body: file.data
        };

        this.s3.upload(params, (err: any, data: { Location: any; }) => {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);

            return data.Location;
        });
    }

    async deleteFile(
        bucketName: string,
        fileName: string
    ) {
        const params = {
            Bucket: bucketName,
            Key: fileName
        };

        this.s3.deleteObject(params, (err: any, data: any) => {
            if (err) {
                throw err;
            }
            console.log('File deleted successfully');
        });
    }

    async deleteBucket(
        bucketName: string
    ) {
        const params = {
            Bucket: bucketName
        };

        this.s3.deleteBucket(params, (err: any, data: any) => {
            if (err) {
                throw err;
            }
            console.log('Bucket deleted successfully');
        });
    }

    async createBucketAndUpload(
        bucketName: string,
        file: any,
        locationConstraint?: string
    ) {
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
    }

    async createAndUploadMetadata(
        bucketName: string,
        name: string,
        data: string
    ) {
        const params = {
            Bucket: bucketName,
            Key: `${name}.json`,
            Body: data,
            ContentType: 'application/json'
        };

        this.s3.upload(params, (err: any, data: { Location: any; }) => {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);

            return data.Location;
        });
    }

    async listBuckets() {
        this.s3.listBuckets((err, data) => {
            if (err) {
                throw err;
            }
            console.log('Bucket List', data.Buckets);

            return data.Buckets;
        });
    }

    async listObjects(
        bucketName: string
    ) {
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
    }

    async getObject(
        bucketName: string,
        fileName: string
    ) {
        const params = {
            Bucket: bucketName,
            Key: fileName
        };

        this.s3.getObject(params, (err, data) => {
            if (err) {
                throw err;
            }
            console.log('Bucket Object', data.Body?.toString());

            return data.Body?.toString();
        });
    }

    async getSignedUrl(
        bucketName: string,
        fileName: string
    ) {
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
    }

    async getSignedUrlPutObject(
        bucketName: string,
        fileName: string
    ) {
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
    }

    async getSignedUrlDeleteObject(
        bucketName: string,
        fileName: string
    ) {
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
    }

    async getSignedUrlDeleteBucket(
        bucketName: string
    ) {
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
    }
}
