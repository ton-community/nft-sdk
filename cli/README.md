# NFT CLI Tool

A command line tool for interacting with Non-Fungible Tokens (NFTs) on the TON blockchain. Designed for Non-Devs.

## Requirements

- Node.js 14.x or higher
- A TON wallet or private key

## Installation

1. Clone the repository or download the source code.
2. Change into the project directory.
3. Change into the `cli/` directory
4. Run `npm install` to install dependencies.
5. Run `npm run build` to build the CLI
6. Run `npm link` to use the CLI everywhere

## Usage

### Upload NFT via Pinata:
```
ton-nft-cli upload pinata [path] --apiKey [API Key] --secretApiKey [Secret API Key]
```
This command is used to upload a file to Pinata, which is an IPFS pinning service. You need to replace `[path]` with the path of the file you want to upload, and `[API Key]` and `[Secret API Key]` with your Pinata API keys. 

### Upload NFT via Amazon S3:
```
ton-nft-cli upload s3 [path] --accessKey [Access Key] --secretAccessKey [Secret Access Key] --bucketName [Bucket Name] --fileType [File Type]
```
This command is used to upload a file to Amazon S3. You need to replace `[path]` with the path of the file you want to upload, `[Access Key]` and `[Secret Access Key]` with your Amazon S3 credentials, `[Bucket Name]` with the name of your S3 bucket, and `[File Type]` with the type of the file you are uploading. 

### Get NFT collections:
```
ton-nft-cli collections [limit] [offset]
```
This command is used to get a list of NFT collections. You can optionally specify a `[limit]` to limit the number of collections returned, and an `[offset]` to skip a certain number of collections.

### Get NFT collection by address:
```
ton-nft-cli collection [Address]
```
This command is used to get an NFT collection by its address. You need to replace `[Address]` with the address of the NFT collection.

### Get NFT items from collection by address:
```
ton-nft-cli collection-items [Address] [limit] [offset]
```
This command is used to get NFT items from a collection by its address. You need to replace `[Address]` with the address of the NFT collection. You can optionally specify a `[limit]` to limit the number of items returned, and an `[offset]` to skip a certain number of items.

### Get NFT item by its address:
```
ton-nft-cli item [Address]
```
This command is used to get an NFT item by its address. You need to replace `[Address]` with the address of the NFT item.

### Create a keypair:
```
ton-nft-cli keypair create
```
This command is used to create a new keypair.

### Create a single NFT:
```
ton-nft-cli nft-single create [configPath] [secretKey]
```
This command is used to create a single NFT. You need to replace `[configPath]` with the path of the NFT single data config JSON file, and optionally `[secretKey]` with your secret key.

### Transfer an NFT:
```
ton-nft-cli nft-single transfer [destination] [configPath] [secretKey]
```
This command is used to transfer an NFT single. You need to replace `[destination]` with the destination address, `[configPath]` with the path of the transfer configuration JSON file, and `[secretKey]` with the secret key of the sender.

### Create a NFT Collection:
```
ton-nft-cli nft-collection create [configPath] [secretKey]
```
This command is used to create a NFT Collection. You need to replace `[configPath]` with the path of the NFT collection data config JSON file, and optionally `[secretKey]` with your secret key.