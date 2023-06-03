export class Storage {
    // Function to upload images
    async uploadImage(
        provider: ProviderInterface,
        imagePath: string
    ): Promise<string> {
        return await provider.uploadImage(imagePath)
    }

    // Function to upload multiple images
    async uploadImages(
        provider: ProviderInterface,
        folderPath: string
    ): Promise<string[]> {
        return await provider.uploadImages(folderPath)
    }

    // Function to upload json file
    async uploadJson(
        provider: ProviderInterface,
        jsonPath: string
    ): Promise<string> {
        return await provider.uploadJson(jsonPath)
    }

    // Function to upload multiple json files
    async uploadJsonBulk(
        provider: ProviderInterface,
        folderPath: string
    ): Promise<string[]> {
        return await provider.uploadJsonBulk(folderPath)
    }

    // Function to upload multiple json files
    async uploadBulk(
        provider: ProviderInterface,
        assetsFolderPath: string
    ): Promise<[string[], string[]]> {
        return await provider.uploadBulk(assetsFolderPath)
    }
}

export interface ProviderInterface {
    uploadImage: (imagePath: string) => Promise<string>
    uploadImages: (folderPath: string) => Promise<string[]>
    uploadJson: (jsonPath: string) => Promise<string>
    uploadJsonBulk: (folderPath: string) => Promise<string[]>
    uploadBulk: (assetsFolderPath: string) => Promise<[string[], string[]]>
}