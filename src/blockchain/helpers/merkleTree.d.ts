/// <reference types="node" />
export declare class MerkleTree {
    leafs: Array<Buffer>;
    layers: Array<Array<Buffer>>;
    constructor(leafs: Array<Buffer>);
    static nodeHash(data: Buffer): Buffer;
    static internalHash(first: Buffer, second: Buffer | undefined): Buffer;
    getRoot(): Buffer;
    getRootArray(): number[];
    getProof(idx: number): Buffer[];
    getProofArray(index: number): any[];
    getHexRoot(): string;
    getHexProof(idx: number): string[];
    verifyProof(idx: number, proof: Buffer[], root: Buffer): boolean;
    static verifyClaim(leaf: Buffer, proof: Buffer[], root: Buffer): boolean;
}
