import { S3 } from 'aws-sdk'
import { error } from 'console'
import fs from 'fs'
import path from 'path'

/**
 * AmazonS3 is a class that provides utility functions for interacting with Amazon S3.
 */
export class AmazonS3 {
    public s3: S3

    /**
     * Creates an instance of the AmazonS3 class.
     * @param accessKeyId - The access key ID for your AWS account.
     * @param secretAccessKey - The secret access key for your AWS account.
     */
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

    /**
     * Uploads an image file to an S3 bucket.
     * @param imagePath - The path to the image file to be uploaded.
     * @param options - Optional configuration options.
     * @returns A Promise that resolves to the URL of the uploaded image.
     */
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
        }

        await this.s3.upload(params).promise()

        return `https://${bucketName}.s3.amazonaws.com/${params.Key}`
    }

    /**
     * Uploads multiple image files from a folder to an S3 bucket.
     * @param folderPath - The path to the folder containing the image files.
     * @param options - Optional configuration options.
     * @returns A Promise that resolves to an array of URLs of the uploaded images.
     */
    async uploadImages(
        folderPath: string, 
        options?: {
            bucketName: string
        }
    ): Promise<string[]> {
        const files = fs.readdirSync(folderPath)
        const uploadPromises = files.map(file => this.uploadImage(path.join(folderPath, file), options))
        return Promise.all(uploadPromises)
    }

    /**
     * Uploads a JSON file to an S3 bucket.
     * @param jsonPath - The path to the JSON file to be uploaded.
     * @param options - Optional configuration options.
     * @returns A Promise that resolves to the URL of the uploaded JSON file.
     */
    async uploadJson(
        jsonPath: string,
        options?: {
            bucketName: string
        }
    ): Promise<string> {
        const fileContent = fs.readFileSync(jsonPath)
        const bucketName = options?.bucketName ?? "TON_NFT"

        const params = {
            Bucket: bucketName,
            Key: path.basename(jsonPath), // File name you want to save as in S3
            Body: fileContent,
            ContentType: 'application/json', // JSON file mimetype
        }

        await this.s3.upload(params).promise()

        return `https://${bucketName}.s3.amazonaws.com/${params.Key}`
    }

    /**
     * Uploads multiple JSON files from a folder to an S3 bucket.
     * @param folderPath - The path to the folder containing the JSON files.
     * @param options - Optional configuration options.
     * @returns A Promise that resolves to an array of URLs of the uploaded JSON files.
     */
    async uploadJsonBulk(
        folderPath: string,
        options?: {
            bucketName: string
        }
    ): Promise<string[]> {
        const files = fs.readdirSync(folderPath)
        const uploadPromises = files.map(file => this.uploadJson(path.join(folderPath, file), options))
        return Promise.all(uploadPromises)
    }

    /**
     * Returns the S3 client interface.
     * @returns A Promise that resolves to the S3 client interface.
     */
    async getClient(): Promise<S3> {
        return this.s3
    }

    /**
     * Uploads images in bulk to IPFS using Pinata SDK in ascending order of file names and returns their URLs.
     * @param assetsFolderPath - The path to the folder containing the image and JSON files.
     * @param options - Optional configuration options.
     * @returns A Promise that resolves to an array of two arrays:
     * - The first array contains the URLs of the uploaded images on IPFS.
     * - The second array contains the URLs of the uploaded JSON files on IPFS.
     */
    async uploadBulk(
        assetsFolderPath: string,
        options?: {
            bucketName: string
        }
    ): Promise<[string[], string[]]> {
        try {
            // Read the directory
            const files = fs.readdirSync(assetsFolderPath)
    
            // Filter and sort image files
            const imageFiles = files
                .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
                .sort((a, b) => parseInt(a) - parseInt(b))
    
            // Process image uploads in ascending order and collect their URLs
            const imageUrls: string[] = []
            const jsonUrls: string[] = []
    
            for (const imageFile of imageFiles) {
                // Read image file
                const imagePath = path.join(assetsFolderPath, imageFile)
    
                // Upload the image to S3
                const imageUrl = await this.uploadImage(imagePath, options)
                imageUrls.push(imageUrl)
    
                // Read the JSON file with the same filename as the image
                const jsonFilePath = path.join(
                    assetsFolderPath,
                    `${path.parse(imageFile).name}.json`
                )
    
                if (fs.existsSync(jsonFilePath)) {
                    // Upload the JSON file to S3
                    const jsonUrl = await this.uploadJson(jsonFilePath, options)
                    jsonUrls.push(jsonUrl)
                    console.log(`JSON file uploaded to S3: ${jsonUrl}`)
                } else {
                    error('Metadata not found for', path.parse(imageFile).name)
                }
            }
    
            console.log('All images uploaded successfully!')
            return [imageUrls, jsonUrls]
        } catch (error) {
            console.error('Error uploading images to S3:', error)
            throw error
        }
    }    

    /**
     * Creates an S3 bucket.
     * @param bucketName - The name of the bucket to be created.
     * @param locationConstraint - The AWS region to create the bucket in. Defaults to 'eu-west-1' if not specified.
     * @returns The location of the created bucket.
     */
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