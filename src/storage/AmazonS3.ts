import { S3 } from 'aws-sdk';

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
