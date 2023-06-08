import PinataClient from '@pinata/sdk'
import { error } from 'console'
import fs from 'fs'
import path from 'path'
import { ProviderInterface } from '.'

/**
 * Pinata is a class that provides utility functions for interacting with Pinata for IPFS integration.
 */
export class Pinata implements ProviderInterface {
    private pinata: PinataClient

    /**
     * Creates an instance of the Pinata class.
     * @param apiKey - The API key for Pinata.
     * @param secretApiKey - The secret API key for Pinata.
     */
    constructor (
        apiKey: string,
        secretApiKey: string,
    ) {
        this.pinata = new PinataClient(apiKey, secretApiKey)
    }

    /**
     * Uploads an image file to IPFS using Pinata SDK.
     * @param imagePath - The path to the image file to be uploaded.
     * @returns A Promise that resolves to the URL of the uploaded image on IPFS.
     */
    async uploadImage(imagePath: string): Promise<string> {
        const fileContent = fs.createReadStream(imagePath)
        const response = await this.pinata.pinFileToIPFS(fileContent)
        return `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`
    }
    
    /**
     * Uploads multiple image files from a folder to IPFS using Pinata SDK.
     * @param folderPath - The path to the folder containing the image files.
     * @returns A Promise that resolves to an array of URLs of the uploaded images on IPFS.
     */
    async uploadImages(folderPath: string): Promise<string[]> {
        const files = fs.readdirSync(folderPath)
        const uploadPromises = files.map(file => this.uploadImage(path.join(folderPath, file)))
        return Promise.all(uploadPromises)
    }
    
    /**
     * Uploads a JSON file to IPFS using Pinata SDK.
     * @param jsonPath - The path to the JSON file to be uploaded.
     * @returns A Promise that resolves to the URL of the uploaded JSON file on IPFS.
     */
    async uploadJson(jsonPath: string): Promise<string> {
        const fileContent = fs.readFileSync(jsonPath)
        const jsonData = JSON.parse(fileContent.toString())
        const response = await this.pinata.pinJSONToIPFS(jsonData)
        return `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`
    }
    
    /**
     * Uploads multiple JSON files from a folder to IPFS using Pinata SDK.
     * @param folderPath - The path to the folder containing the JSON files.
     * @returns A Promise that resolves to an array of URLs of the uploaded JSON files on IPFS.
     */
    async uploadJsonBulk(folderPath: string): Promise<string[]> {
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
        // eslint-disable-next-line no-useless-catch
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
                const imageData = fs.createReadStream(imagePath)
        
                // Upload the image to IPFS using Pinata SDK
                const result = await this.pinata.pinFileToIPFS(imageData, {
                    pinataMetadata: {
                        name: imageFile,
                    },
                })
        
                // Add the image URL to the array
                const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
                imageUrls.push(ipfsUrl)
        
                // Read the JSON file with the same filename as the image
                const jsonFilePath = path.join(
                    assetsFolderPath,
                    `${path.parse(imageFile).name}.json`
                )
        
                if (fs.existsSync(jsonFilePath)) {
                    const jsonFile = fs.readFileSync(jsonFilePath, 'utf8')
                    const jsonData = JSON.parse(jsonFile)
            
                    // Add the IPFS URL to the JSON data
                    jsonData.image = ipfsUrl
            
                    // Write the updated JSON data to the file
                    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData))

                    // Upload the JSON file to IPFS using Pinata SDK
                    const jsonFileData = fs.createReadStream(
                        jsonFilePath
                    )
                
                    const jsonResult = await this.pinata.pinFileToIPFS(jsonFileData, {
                        pinataMetadata: {
                            name: `${path.parse(imageFile).name}.json`,
                        },
                    })
                
                    const jsonUrl = `https://gateway.pinata.cloud/ipfs/${jsonResult.IpfsHash}`
                    jsonUrls.push(jsonUrl)
                }
            }
        
            return [imageUrls, jsonUrls]
        } catch (error) {
            
            throw error
        }            
    }
}
