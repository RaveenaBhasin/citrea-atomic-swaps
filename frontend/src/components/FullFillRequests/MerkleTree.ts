import { hash256 } from "../../utils/hashUtils";

interface MerkleTreeInterface {
    leaves: string[];
    levels: string[][];
    isReady: boolean;
    buildTree(): void;
    getProof(index: number): string[] | null;
    getMerkleRoot(): string | null;
}

class MerkleTree implements MerkleTreeInterface {
    leaves: string[];
    levels: string[][];
    isReady: boolean;

    constructor(transactions: string[]) {
        this.leaves = [...transactions];
        this.levels = [];
        this.isReady = false;
        this.buildTree();
    }

    buildTree(): void {
        if (!this.leaves.length) {
            this.isReady = false;
            return;
        }

        let currentLevel = [...this.leaves];
        this.levels.push(currentLevel);

        while (currentLevel.length > 1) {
            const newLevel: string[] = [];
            
            for (let i = 0; i < currentLevel.length; i += 2) {
                if (i + 1 < currentLevel.length) {
                    const combined = currentLevel[i] + currentLevel[i + 1];
                    newLevel.push(hash256(combined));
                } else {
                    const combined = currentLevel[i] + currentLevel[i];
                    newLevel.push(hash256(combined));
                    console.log(newLevel);
                }
            }
            
            currentLevel = newLevel;
            this.levels.push(currentLevel);
        }
        
        console.log(this.levels[this.levels.length - 1][0]);
        this.isReady = true;
    }

    getProof(index: number): string[] | null {
        if (!this.isReady || index < 0 || index >= this.leaves.length) {
            return null;
        }

        console.log(this.levels);
        const proof: string[] = [];
        
        for (let x = 0; x < this.levels.length - 1; x++) {
            const levelLen = this.levels[x].length;

            if (index === levelLen - 1 && levelLen % 2 === 1) {
                proof.push(this.levels[x][index]);
                index = Math.floor(index / 2);
                continue;
            }

            const isRightNode = index % 2 === 1;
            const siblingIndex = isRightNode ? index - 1 : index + 1;

            if (siblingIndex >= 0 && siblingIndex < levelLen) {
                const siblingValue = this.levels[x][siblingIndex];
                proof.push(siblingValue);
            }

            index = Math.floor(index / 2);
        }

        return proof;
    }

    getMerkleRoot(): string | null {
        return this.levels.length ? this.levels[this.levels.length - 1][0] : null;
    }

    static verifyProof(leaf: string, proof: string[], root: string): boolean {
        let computedHash = leaf;

        for (const proofElement of proof) {
            const combined = computedHash < proofElement ? 
                computedHash + proofElement : 
                proofElement + computedHash;
            computedHash = hash256(combined);
        }

        return computedHash === root;
    }
}

export default MerkleTree;