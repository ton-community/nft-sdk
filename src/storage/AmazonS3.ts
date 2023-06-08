import { S3 } from 'aws-sdk'
import { error } from 'console'
import fs from 'fs'
import path from 'path'
import {ProviderInterface} from './'

/**
 * AmazonS3 is a class that provides utility functions for interacting with Amazon S3.
 */
export class AmazonS3 implements ProviderInterface {
    public s3: S3

    /**
     * Creates an instance of the AmazonS3 class.
     * @param accessKeyId - The access key ID for your AWS account.
     * @param secretAccessKey - The secret access key for your AWS account.
     */
    constructor (
        accessKeyId: string,
        secretAccessKey: string,
        readonly bucketName: string
    ) {
        this.s3 = new S3(
            {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            }
        )
    }

    /**
     * Uploads an image file to an S3 bucket.
     * @param imagePath - The path to the image file to be uploaded.
     * @returns A Promise that resolves to the URL of the uploaded image.
     */
    async uploadImage(
        imagePath: string
    ): Promise<string> {
        const fileContent = fs.readFileSync(imagePath)

        const params = {
            Bucket: this.bucketName, // Set the bucket name passed as an option or use the default bucket name
            Key: path.basename(imagePath), // File name you want to save as in S3
            Body: fileContent,
            ContentType: 'image/jpeg', // adjust as needed
        }

        await this.s3.upload(params).promise()

        return `https://${this.bucketName}.s3.amazonaws.com/${params.Key}`
    }

    /**
     * Uploads multiple image files from a folder to an S3 bucket.
     * @param folderPath - The path to the folder containing the image files.
     * @returns A Promise that resolves to an array of URLs of the uploaded images.
     */
    async uploadImages(
        folderPath: string
    ): Promise<string[]> {
        const files = fs.readdirSync(folderPath)
        const uploadPromises = files.map(file => this.uploadImage(path.join(folderPath, file)))
        return Promise.all(uploadPromises)
    }

    /**
     * Uploads a JSON file to an S3 bucket.
     * @param jsonPath - The path to the JSON file to be uploaded.
     * @returns A Promise that resolves to the URL of the uploaded JSON file.
     */
    async uploadJson(
        jsonPath: string
    ): Promise<string> {
        const fileContent = fs.readFileSync(jsonPath)

        const params = {
            Bucket: this.bucketName,
            Key: path.basename(jsonPath), // File name you want to save as in S3
            Body: fileContent,
            ContentType: 'application/json', // JSON file mimetype
        }

        await this.s3.upload(params).promise()

        return `https://${this.bucketName}.s3.amazonaws.com/${params.Key}`
    }

    /**
     * Uploads multiple JSON files from a folder to an S3 bucket.
     * @param folderPath - The path to the folder containing the JSON files.
     * @returns A Promise that resolves to an array of URLs of the uploaded JSON files.
     */
    async uploadJsonBulk(
        folderPath: string
    ): Promise<string[]> {
        const files = fs.readdirSync(folderPath)
        const uploadPromises = files.map(file => this.uploadJson(path.join(folderPath, file)))
        return Promise.all(uploadPromises)
    }

    /**
     * Uploads images in bulk to IPFS using Pinata SDK in ascending order of file names and returns their URLs.
     * @param assetsFolderPath - The path to the folder containing the image and JSON files.
     * @returns A Promise that resolves to an array of two arrays:
     * - The first array contains the URLs of the uploaded images on IPFS.
     * - The second array contains the URLs of the uploaded JSON files on IPFS.
     */
    async uploadBulk(
        assetsFolderPath: string
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
                const imageUrl = await this.uploadImage(imagePath)
                imageUrls.push(imageUrl)
    
                // Read the JSON file with the same filename as the image
                const jsonFilePath = path.join(
                    assetsFolderPath,
                    `${path.parse(imageFile).name}.json`
                )
    
                if (fs.existsSync(jsonFilePath)) {
                    // Upload the JSON file to S3
                    const jsonUrl = await this.uploadJson(jsonFilePath)
                    jsonUrls.push(jsonUrl)
                } else {

                }
            }

            return [imageUrls, jsonUrls]
        } catch (error) {
            throw error
        }
    }    
}