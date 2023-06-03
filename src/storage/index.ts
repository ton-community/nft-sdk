export class Storage {
    constructor(
        readonly provider: ProviderInterface
    ) {}

    // Function to upload images
    async uploadImage(
        imagePath: string
    ): Promise<string> {
        return await this.provider.uploadImage(imagePath)
    }

    // Function to upload multiple images
    async uploadImages(
        folderPath: string
    ): Promise<string[]> {
        return await this.provider.uploadImages(folderPath)
    }

    // Function to upload json file
    async uploadJson(
        jsonPath: string
    ): Promise<string> {
        return await this.provider.uploadJson(jsonPath)
    }

    // Function to upload multiple json files
    async uploadJsonBulk(
        folderPath: string
    ): Promise<string[]> {
        return await this.provider.uploadJsonBulk(folderPath)
    }

    // Function to upload multiple json files
    async uploadBulk(
        assetsFolderPath: string
    ): Promise<[string[], string[]]> {
        return await this.provider.uploadBulk(assetsFolderPath)
    }
}

export interface ProviderInterface {
    uploadImage: (imagePath: string) => Promise<string>
    uploadImages: (folderPath: string) => Promise<string[]>
    uploadJson: (jsonPath: string) => Promise<string>
    uploadJsonBulk: (folderPath: string) => Promise<string[]>
    uploadBulk: (assetsFolderPath: string) => Promise<[string[], string[]]>
}