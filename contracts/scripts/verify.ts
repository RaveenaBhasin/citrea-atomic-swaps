import axios from "axios";
import { error } from "console";
import crypto from "crypto";
import readline from "readline";


const API_URL = "https://bitcoin-testnet4.gateway.tatum.io/";
const API_KEY = "t-67540735f66f7bf84a21a6cf-70c26b1b7ca7467fa46b64c1";

function hash256(hexString: string): string {
  const binaryData = Buffer.from(hexString, "hex");
  const hash1 = crypto.createHash("sha256").update(binaryData).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  return hash2.toString("hex");
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
  return Buffer.from(hexString, "hex").reverse().toString("hex");
}

class MerkleTree {
  private levels: string[][] = [];
  private leaves: string[];

  constructor(transactions: string[]) {
    this.leaves = transactions;
    this.buildTree();
  }

  private buildTree(): void {
    let currentLevel = [...this.leaves];
    this.levels.push(currentLevel);

    while (currentLevel.length > 1) {
      const newLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || currentLevel[i]; // Duplicate if odd
        newLevel.push(hash256(left + right));
      }
      this.levels.push(newLevel);
      currentLevel = newLevel;
    }
  }

  getMerkleRoot(): string {
    return this.levels[this.levels.length - 1]?.[0] || "";
  }

  getProof(index: number): string {
    const proof: string[] = [];
    let idx = index;

    for (let level of this.levels) {
      const levelLen = level.length;

      if (idx === levelLen - 1 && levelLen % 2 === 1) {
        proof.push(level[idx]);
        console.log("proof now", idx, proof);
      } else {
        const isRightNode = idx % 2 === 1;
        const siblingIdx = isRightNode ? idx - 1 : idx + 1;

        if (siblingIdx < levelLen) {
          proof.push(level[siblingIdx]);
          console.log("proof now", idx, proof);
        }
      }

      idx = Math.floor(idx / 2);
    }
    let proofWithoutMerkleRoot = proof.slice(0, proof.length - 1);
    if(!proofWithoutMerkleRoot) {
        throw error("No merkle proof");
    }
    let proofBlock = proofWithoutMerkleRoot.join("");
    return proofBlock
  }
}

async function getUserInput(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    return new Promise((resolve) => rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    }));
  }

async function main(){
    const blockHash = await getUserInput("Enter the block hash: ");
    if (!blockHash) {
    console.error("Block hash is required.");
    return;
  }

  const transactions = await getBlockTransactions(blockHash);
  const doubleHashedResults = ["0000000000000000000000000000000000000000000000000000000000000000"];

  for (const txId of transactions.slice(1)) {
    const rawTx = await getTransactionDetails(txId);
    if (rawTx) {
      doubleHashedResults.push(hash256(rawTx));
    }
  }

  const merkleTree = new MerkleTree(doubleHashedResults);
  const merkleRoot = merkleTree.getMerkleRoot();
  const index = 2; 
  const proof = merkleTree.getProof(index);
  const wtxid = doubleHashedResults[index];

  console.log("==============================");
  console.log(`Block Hash: ${reverseHex(blockHash)}`);
  console.log(`Transaction wtxid: ${wtxid}`);
  console.log(`Merkle Proof: ${proof}`);
}

main()
