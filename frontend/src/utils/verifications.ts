import axios from "axios";



const API_URL = "https://bitcoin-testnet4.gateway.tatum.io/";
const API_KEY = "t-67540735f66f7bf84a21a6cf-70c26b1b7ca7467fa46b64c1";

// Instead of importing crypto, we'll use the global window.crypto
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }
  
  function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  async function hash256(hexString: string): Promise<string> {
    try {
      // Convert hex string to bytes
      const binaryData = hexToBytes(hexString);
      
      // First SHA-256
      const firstHash = await window.crypto.subtle.digest('SHA-256', binaryData);
      
      // Second SHA-256
      const secondHash = await window.crypto.subtle.digest('SHA-256', firstHash);
      
      // Convert to hex string
      return bytesToHex(new Uint8Array(secondHash));
    } catch (error:any) {
      console.error(`Error in hash256: ${error}`);
      throw new Error(`Failed to hash data: ${error.message}`);
    }
  }

async function getBlockTransactions(blockHash: string): Promise<string[]> {
  try {
    const response = await axios.post(
      API_URL,
      {
        jsonrpc: "2.0",
        method: "getblock",
        params: [blockHash],
        id: 1,
      },
      {
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "x-api-key": API_KEY,
        },
      }
    );

    return response.data.result?.tx || [];
  } catch (error) {
    console.error(`Error fetching block: ${error}`);
    return [];
  }
}

async function getTransactionDetails(txId: string): Promise<string> {
  try {
    const response = await axios.post(
      API_URL,
      {
        jsonrpc: "2.0",
        method: "getrawtransaction",
        params: [txId],
        id: 1,
      },
      {
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "x-api-key": API_KEY,
        },
      }
    );

    return response.data.result || "";
  } catch (error) {
    console.error(`Error fetching transaction ${txId}: ${error}`);
    return "";
  }
}

function reverseHex(hexString: string): string {
    // Make sure the hex string has even length
    if (hexString.length % 2 !== 0) {
      hexString = '0' + hexString;
    }
    
    // Split into pairs and reverse
    const pairs = [];
    for (let i = 0; i < hexString.length; i += 2) {
      pairs.push(hexString.substring(i, i + 2));
    }
    
    return pairs.reverse().join('');
  }
  
  

class MerkleTree {
    private levels: string[][] = [];
    private leaves: string[];
    private isBuilt: boolean = false;
  
    constructor(transactions: string[]) {
      this.leaves = transactions;
    }
  
    private async buildTree(): Promise<void> {
      if (this.isBuilt) return;
      
      let currentLevel = [...this.leaves];
      this.levels.push(currentLevel);
  
      while (currentLevel.length > 1) {
        const newLevel: string[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
          const left = currentLevel[i];
          const right = currentLevel[i + 1] || currentLevel[i]; // Duplicate if odd
          const hash = await hash256(left + right);
          newLevel.push(hash);
        }
        this.levels.push(newLevel);
        currentLevel = newLevel;
      }
      
      this.isBuilt = true;
    }
  
    async getMerkleRoot(): Promise<string> {
      await this.buildTree();
      return this.levels[this.levels.length - 1]?.[0] || "";
    }
  
    async getProof(index: number): Promise<string> {
      await this.buildTree();
      
      const proof: string[] = [];
      let idx = index;
  
      for (let level of this.levels) {
        const levelLen = level.length;
  
        if (idx === levelLen - 1 && levelLen % 2 === 1) {
          proof.push(level[idx]);
        } else {
          const isRightNode = idx % 2 === 1;
          const siblingIdx = isRightNode ? idx - 1 : idx + 1;
  
          if (siblingIdx < levelLen) {
            proof.push(level[siblingIdx]);
          }
        }
  
        idx = Math.floor(idx / 2);
      }
      
      let proofWithoutMerkleRoot = proof.slice(0, proof.length - 1);
      if(!proofWithoutMerkleRoot.length) {
        throw new Error("No merkle proof");
      }
      return proofWithoutMerkleRoot.join("");
    }
  }
  
  


export async function getVerificationDetails(blockHash: string, txHash: string) {
   
    // console.log("Getting verification details for blockHash", blockHash, "and txHash", txHash);
    

  const transactions = await getBlockTransactions(blockHash);
  const doubleHashedResults = ["0000000000000000000000000000000000000000000000000000000000000000"];

   for (const txId of transactions.slice(1)) {
    try {
      const rawTx = await getTransactionDetails(txId);
      if (rawTx) {
        const hashedTx = await hash256(rawTx);
        doubleHashedResults.push(hashedTx);
      }
    } catch (error) {
      console.error(`Error processing transaction ${txId}:`, error);
      // Continue with next transaction instead of stopping
      continue;
    }
  }


 
  const merkleTree = new MerkleTree(doubleHashedResults);
//   const merkleRoot = merkleTree.getMerkleRoot();
  const index = transactions.indexOf(txHash);

//   console.log("index", index);
  

const proof = await merkleTree.getProof(index);

//   console.log("proof", proof);
  
  const wtxid = doubleHashedResults[index];

//   console.log("==============================");
//   console.log(`Block Hash: ${reverseHex(blockHash)}`);
//   console.log(`Transaction wtxid: ${wtxid}`);
//   console.log(`Merkle Proof: ${proof}`);

  return {
    blockHash: reverseHex(blockHash),
    wtxid,
    proof,
    index
  }
}

