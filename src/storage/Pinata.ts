import PinataClient from "@pinata/sdk";
import fs from 'fs';
import path from 'path';

// Pinata - For IPFS Integration
export class Pinata {
    private pinata: PinataClient;

    constructor (
        apiKey: string,
        secretApiKey: string,
    ) {
        this.pinata = new PinataClient(apiKey, secretApiKey);
    }

    // Function to upload images in bulk to IPFS using Pinata SDK in ascending order of file names and return their URLs
    async uploadImagesBulk(
        assetsFolderPath: string
        ): Promise<string[]> {
        try {
            // Read the directory
            const files = fs.readdirSync(assetsFolderPath);
        
            // Filter and sort image files
            const imageFiles = files
                .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
                .sort((a, b) => parseInt(a) - parseInt(b));
        
            // Process image uploads in ascending order and collect their URLs
            const imageUrls: string[] = [];
        
            for (const imageFile of imageFiles) {
                // Read image file
                const imagePath = path.join(assetsFolderPath, imageFile);
                const imageData = fs.createReadStream(imagePath);
        
                // Upload the image to IPFS using Pinata SDK
                const result = await this.pinata.pinFileToIPFS(imageData, {
                    pinataMetadata: {
                        name: imageFile
                    }
                });
        
                // Add the image URL to the array
                const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
                imageUrls.push(ipfsUrl);
            }
        
            console.log('All images uploaded successfully!');
            return imageUrls;
        } catch (error) {
            console.error('Error uploading images to IPFS:', error);
            throw error;
        }
    }

    async pinByHash(hashToPin: string): Promise<any> {
        return await this.pinata.pinByHash(hashToPin);
    }

    async pinFileToIPFS(readableStream: any): Promise<any> {
        return await this.pinata.pinFileToIPFS(readableStream);
    }

    async pinFromFS(path: string): Promise<any> {
        return await this.pinata.pinFromFS(path);
    }

    async pinJSONToIPFS(body: any): Promise<any> {
        return await this.pinata.pinJSONToIPFS(body);
    }

    async pinJobs(): Promise<any> {
        return await this.pinata.pinJobs();
    }

    async unpin(hashToUnpin: string): Promise<any> {
        return await this.pinata.unpin(hashToUnpin);
    }
}
