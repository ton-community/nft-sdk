import { CompilerConfig } from '@ton-community/blueprint';

export const compile: CompilerConfig = {
    lang: 'func',
    targets: ['contracts/imports/stdlib.fc', 'contracts/op-codes.fc', 'contracts/params.fc', 'contracts/nft_sdk.fc'],
};
