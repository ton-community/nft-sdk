import { S3 } from 'aws-sdk'
import {AmazonS3} from './AmazonS3'
import { Pinata } from './Pinata'
import PinataClient from '@pinata/sdk'

export class Storage {
    constructor (
        readonly provider: string,
        readonly key: string,
        readonly secretKey: string
    ) {}

    // Function to upload images
    async uploadImage(
        imagePath: string, 
        options?: {
            bucketName: string
        }
    ): Promise<string> {
        if (this.provider === 's3') {
            const s3 = new AmazonS3(
                this.key,
                this.secretKey
            )

            return await s3.uploadImage(
                imagePath, 
                options
            )
        } else if (this.provider === 'pinata') {
            const pinata = new Pinata(
                this.key,
                this.secretKey
            )

            return await pinata.uploadImage(
                imagePath
            )
        } else {
            throw new Error('Invalid provider')
        }
    }

    // Function to upload multiple images
    async uploadImages(
        folderPath: string, 
        options?: {
            bucketName: string
        }
    ): Promise<string[]> {
        if (this.provider === 's3') {
            const s3 = new AmazonS3(
                this.key,
                this.secretKey
            )

            return await s3.uploadImages(
                folderPath, 
                options
            )
        } else if (this.provider === 'pinata') {
            const pinata = new Pinata(
                this.key,
                this.secretKey
            )

            return await pinata.uploadImages(
                folderPath
            )
        } else {
            throw new Error('Invalid provider')
        }
    }

    // Function to upload json file
    async uploadJson(jsonPath: string, options?: {
        bucketName: string
    }): Promise<string> {
        if (this.provider ==='s3') {
            const s3 = new AmazonS3(
                this.key,
                this.secretKey
            )

            return await s3.uploadJson(
                jsonPath, 
                options
            )
        } else if (this.provider === 'pinata') {
            const pinata = new Pinata(
                this.key,
                this.secretKey
            )

            return await pinata.uploadJson(
                jsonPath
            )
        } else {
            throw new Error('Invalid provider')
        }
    }

    // Function to upload multiple json files
    async uploadJsonBulk(
        folderPath: string,
        options?: {
            bucketName: string
        }
    ): Promise<string[]> {
        if (this.provider ==='s3') {
            const s3 = new AmazonS3(
                this.key,
                this.secretKey
            )

            return await s3.uploadJsonBulk(
                folderPath, 
                options
            )
        } else if (this.provider === 'pinata') {
            const pinata = new Pinata(
                this.key,
                this.secretKey
            )

            return await pinata.uploadJsonBulk(
                folderPath
            )
        } else {
            throw new Error('Invalid provider')
        }
    }

    // Function to get client
    async getClient(): Promise<S3 | PinataClient> {
        if (this.provider ==='s3') {
            const s3 = new AmazonS3(
                this.key,
                this.secretKey
            )

            return s3.getClient()
        } else if (this.provider === 'pinata') {
            const pinata = new Pinata(
                this.key,
                this.secretKey
            )

            return pinata.getClient()
        } else {
            throw new Error('Invalid provider')
        }
    }
}
