import PinataClient from "@pinata/sdk";
import { error } from "console";
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
                  .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
                  .sort((a, b) => parseInt(a) - parseInt(b));
            
                // Process image uploads in ascending order and collect their URLs
                const imageUrls = [];
            
                for (const imageFile of imageFiles) {
                  // Read image file
                  const imagePath = path.join(assetsFolderPath, imageFile);
                  const imageData = fs.createReadStream(imagePath);
            
                  // Upload the image to IPFS using Pinata SDK
                  const result = await this.pinata.pinFileToIPFS(imageData, {
                    pinataMetadata: {
                      name: imageFile,
                    },
                  });
            
                  // Add the image URL to the array
                  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
                  imageUrls.push(ipfsUrl);
            
                  // Read the JSON file with the same filename as the image
                  const jsonFilePath = path.join(
                    assetsFolderPath,
                    `${path.parse(imageFile).name}.json`
                  );
            
                  if (fs.existsSync(jsonFilePath)) {
                    const jsonFile = fs.readFileSync(jsonFilePath, 'utf8');
                    const jsonData = JSON.parse(jsonFile);
            
                    // Add the IPFS URL to the JSON data
                    jsonData.image = ipfsUrl;
            
                    // Write the updated JSON data to the file
                    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData));

                    // Upload the JSON file to IPFS using Pinata SDK
                    const jsonFileData = fs.createReadStream(
                        jsonFilePath
                    );
                
                    const jsonResult = await this.pinata.pinFileToIPFS(jsonFileData, {
                        pinataMetadata: {
                            name: `${path.parse(imageFile).name}.json`,
                        },
                    });
                
                    const jsonUrl = `https://gateway.pinata.cloud/ipfs/${jsonResult.IpfsHash}`;
                    console.log(`JSON file uploaded to IPFS: ${jsonUrl}`);
                  } else {
                    error("Metadata not found for", path.parse(imageFile).name)
                  }
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
