import { NFTStorage, File } from 'nft.storage';
import { error } from 'console';
import fs from 'fs';
import path from 'path';

// NFT.Storage - For IPFS and NFT Integration
export class NFTStorageWrapper {
    private nftStorage: NFTStorage;

    constructor(apiKey: string) {
        this.nftStorage = new NFTStorage({ token: apiKey });
    }

    // Function to upload images in bulk to IPFS using NFT.Storage SDK in ascending order of file names and return their URLs
    async uploadBulk(assetsFolderPath: string): Promise<string[]> {
        try {
            // Read the directory
            const files = fs.readdirSync(assetsFolderPath);

            // Filter and sort image files
            const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)).sort((a, b) => parseInt(a) - parseInt(b));

            // Process image uploads in ascending order and collect their URLs
            const imageUrls = [];

            for (const imageFile of imageFiles) {
                // Read image file
                const imagePath = path.join(assetsFolderPath, imageFile);

                // Upload the image to IPFS using NFT.Storage SDK
                const imageData = new File([fs.readFileSync(imagePath)], imageFile);
                const cid = await this.nftStorage.storeBlob(imageData);

                // Add the image URL to the array
                const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
                imageUrls.push(ipfsUrl);

                // Read the JSON file with the same filename as the image
                const jsonFilePath = path.join(assetsFolderPath, `${path.parse(imageFile).name}.json`);

                if (fs.existsSync(jsonFilePath)) {
                    const jsonFile = fs.readFileSync(jsonFilePath, 'utf8');
                    const jsonData = JSON.parse(jsonFile);

                    // Add the IPFS URL to the JSON data
                    jsonData.image = ipfsUrl;

                    // Write the updated JSON data to the file
                    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData));

                    // Upload the JSON file to IPFS using NFT.Storage SDK
                    const jsonFileData = new File([fs.readFileSync(jsonFilePath)], `${path.parse(imageFile).name}.json`);
                    const jsonCid = await this.nftStorage.storeBlob(jsonFileData);

                    const jsonUrl = `https://ipfs.io/ipfs/${jsonCid}`;
                    console.log(`JSON file uploaded to IPFS: ${jsonUrl}`);
                } else {
                    error("Metadata not found for", path.parse(imageFile).name);
                }
            }

            console.log('All images uploaded successfully!');
            return imageUrls;
        } catch (error) {
            console.error('Error uploading images to IPFS:', error);
            throw error;
        }
    }

    async storeBlob(file: File): Promise<string> {
        const cid = await this.nftStorage.storeBlob(file);
        return `https://ipfs.io/ipfs/${cid}`;
    }
}