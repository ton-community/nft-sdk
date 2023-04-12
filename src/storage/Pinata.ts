import PinataClient from "@pinata/sdk";
import fs from 'fs';

// Pinata - For IPFS Integration
export class Pinata {
    private pinata: PinataClient;

    constructor (
        apiKey: string,
        secretApiKey: string,
    ) {
        this.pinata = new PinataClient(apiKey, secretApiKey);
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
