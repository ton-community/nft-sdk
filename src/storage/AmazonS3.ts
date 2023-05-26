import { S3 } from 'aws-sdk'
import { error } from 'console'
import fs from 'fs'
import path from 'path'

export class AmazonS3 {
    public s3: S3

    constructor (
        accessKeyId: string,
        secretAccessKey: string
    ) {
        this.s3 = new S3(
            {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            }
        )
    }

    // Function to upload an image
    async uploadImage(
        imagePath: string, 
        options?: {
            bucketName: string
        }
    ): Promise<string> {
        const fileContent = fs.readFileSync(imagePath)
        const bucketName = options?.bucketName ?? "TON_NFT"

        const params = {
            Bucket: bucketName, // Set the bucket name passed as an option or use the default bucket name
            Key: path.basename(imagePath), // File name you want to save as in S3
            Body: fileContent,
            ContentType: 'image/jpeg', // adjust as needed
        };

        await this.s3.upload(params).promise();

        return `https://${bucketName}.s3.amazonaws.com/${params.Key}`;
    }

    // Function to upload multiple images
    async uploadImages(
        folderPath: string, 
        options?: {
            bucketName: string
        }
    ): Promise<string[]> {
        const files = fs.readdirSync(folderPath);
        const uploadPromises = files.map(file => this.uploadImage(path.join(folderPath, file), options));
        return Promise.all(uploadPromises);
    }

    // Function to upload a JSON file
    async uploadJson(
        jsonPath: string,
        options?: {
            bucketName: string
        }
    ): Promise<string> {
        const fileContent = fs.readFileSync(jsonPath);
        const bucketName = options?.bucketName ?? "TON_NFT"

        const params = {
            Bucket: bucketName,
            Key: path.basename(jsonPath), // File name you want to save as in S3
            Body: fileContent,
            ContentType: 'application/json', // JSON file mimetype
        };

        await this.s3.upload(params).promise();

        return `https://${bucketName}.s3.amazonaws.com/${params.Key}`;
    }

    // Function to upload multiple JSON files
    async uploadJsonBulk(
        folderPath: string,
        options?: {
            bucketName: string
        }
    ): Promise<string[]> {
        const files = fs.readdirSync(folderPath);
        const uploadPromises = files.map(file => this.uploadJson(path.join(folderPath, file), options));
        return Promise.all(uploadPromises);
    }

    // Function to return S3 client interface
    async getClient(): Promise<AWS.S3> {
        return this.s3;
    }

    // Function to upload images & json in bulk to Amazon S3
    // async uploadImagesAndMetadata(
    //     assetsFolderPath: string, 
    //     s3BucketName: string,
    //     options?: {
    //         type: string
    //     }
    // ): Promise<string[]> {
    //     try {
            // Check if the S3 bucket exists, create it if it doesn't exist
    //         const bucketExists = await this.s3.headBucket({ Bucket: s3BucketName }).promise().then(() => true).catch(() => false)
    //         if (!bucketExists) {
    //             await this.createBucket(s3BucketName)
    //         }

            // Read the directory
    //         const files = fs.readdirSync(assetsFolderPath)

            // Filter and sort image files
    //         const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)).sort((a, b) => parseInt(a) - parseInt(b))

            // Process image uploads in ascending order and collect their URLs
    //         const imageUrls: string[] = []

    //         for (const imageFile of imageFiles) {
                // Read image file
    //             const imagePath = path.join(assetsFolderPath, imageFile)
    //             const imageData = fs.readFileSync(imagePath)

                // Prepare S3 upload parameters
    //             const params: AWS.S3.PutObjectRequest = {
    //                 Bucket: s3BucketName,
    //                 Key: imageFile,
    //                 Body: imageData,
    //                 ContentType: options?.type ?? 'image/jpeg', // Adjust this if you are handling multiple image formats
    //             }

                // Upload the image to S3
    //             await this.s3.upload(params).promise()

                // Add the image URL to the array
    //             imageUrls.push(`https://${s3BucketName}.s3.amazonaws.com/${imageFile}`)

                // Read the JSON file with the same filename as the image
    //             const jsonFilePath = path.join(assetsFolderPath, `${path.parse(imageFile).name}.json`)

    //             if (fs.existsSync(jsonFilePath)) {
                    // Read the JSON file
    //                 const jsonFile = fs.readFileSync(jsonFilePath, 'utf8')
    //                 const jsonData = JSON.parse(jsonFile)

                    // Upload the JSON file to S3
    //                 const jsonParams: AWS.S3.PutObjectRequest = {
    //                     Bucket: s3BucketName,
    //                     Key: `${path.parse(imageFile).name}.json`,
    //                     Body: jsonData,
    //                     ContentType: 'application/json',
    //                 }
    //                 await this.s3.upload(jsonParams).promise()
    //             } else {
    //                 error('Metadata not found for', path.parse(imageFile).name)
    //             }
    //         }

    //         console.log('All images uploaded successfully!')
    //         return imageUrls
    //     } catch (error) {
    //         console.error('Error uploading images to S3:', error)
    //         throw error
    //     }
    // }

    async createBucket(
        bucketName: string,
        locationConstraint?: string
    ) {
        const params = {
            Bucket: bucketName,
            CreateBucketConfiguration: {
                // Set your region here
                LocationConstraint: !locationConstraint ? 'eu-west-1' : locationConstraint
            }
        }
        
        this.s3.createBucket(params, (err, data) => {
            if (err) console.log(err, err.stack)
            else console.log('Bucket Created Successfully', data.Location)

            return data.Location
        })
    }
}