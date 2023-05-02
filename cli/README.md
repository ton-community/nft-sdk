# NFT CLI Tool

A command line tool for interacting with Non-Fungible Tokens (NFTs) on the TON blockchain.

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

### Uploading an NFT via Pinata

```
$ ton-nft-cli upload [path] --apiKey <apiKey> --secretApiKey <secretApiKey>
```

This command uploads a file or folder to Pinata and returns the URLs of the uploaded files.

### Get NFT collections

```
$ ton-nft-cli collections [limit] [offset]
```

This command retrieves the available NFT collections.

### Get NFT collection by address

```
$ ton-nft-cli collection <address>
```

This command retrieves an NFT collection by its address.

### Get NFT items from a collection by address

```
$ ton-nft-cli collection-items <address> [limit] [offset]
```

This command retrieves NFT items from a collection by its address.

### Get NFT item by address

```
$ ton-nft-cli item <address>
```

This command retrieves an NFT item by its address.

### Fetch and parse transaction data

```
$ ton-nft-cli transactions <address> [limit]
```

This command fetches and parses transaction data for a given address.

### Create a keypair

```
$ ton-nft-cli create keypair
```

This command generates a new keypair.

### Create a single NFT

```
$ ton-nft-cli create nft-single <configPath> [secretKey]
```

This command creates a single NFT using the configuration provided in the JSON file at the specified path.

### Transfer an NFT Single

```
$ ton-nft-cli nft-single transfer <destination> [configPath] [secretKey]
```

This command transfers an NFT single to a destination address.

### Create an NFT Collection

```
$ ton-nft-cli create nft-collection <configPath> [secretKey]
```

This command creates an NFT collection using the configuration provided in the JSON file at the specified path.

## Configuration

The NFT single and NFT collection commands require a JSON file with the following structure:

### NFT Single

```json
{
  "name": "My NFT",
  "description": "This is an example NFT",
  "image": "https://example.com/image.png",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Rare"
    }
  ]
}
```

### NFT Collection

```json
{
  "name": "My NFT Collection",
  "description": "This is an example NFT collection",
  "image": "https://example.com/image.png",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Rare"
    }
  ],
  "items": [
    {
      "name": "Item 1",
      "description": "This is item 1",
      "image": "https://example.com/item1.png",
      "attributes": [
        {
          "trait_type": "Rarity",
          "value": "Common"
        }
      ]
    },
    {
      "name": "Item 2",
      "description": "This is item 2",
      "image": "https://example.com/item2.png",
      "attributes": [
        {
          "trait_type": "Rarity",
          "value": "Rare"
        }
      ]
    }
}
```