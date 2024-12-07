import hashlib

import requests
import hashlib
import json

API_URL = "https://bitcoin-testnet4.gateway.tatum.io/"
API_KEY = "t-67540735f66f7bf84a21a6cf-70c26b1b7ca7467fa46b64c1"
block_hash = ""

def hash256(hex_string):
    """Double SHA-256 hash of a hexadecimal string."""
    binary_data = bytes.fromhex(hex_string)
    hash1 = hashlib.sha256(binary_data).digest()
    hash2 = hashlib.sha256(hash1).digest()
    return hash2.hex()

def get_block_transactions(block_hash):
    """Get transactions in a block."""
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API_KEY,
    }
    data = {
        "jsonrpc": "2.0",
        "method": "getblock",
        "params": [block_hash],
        "id": 1
    }
    response = requests.post(API_URL, headers=headers, json=data)
    if response.status_code == 200:
        response_json = response.json()
        return response_json.get("result", {}).get("tx", [])
    else:
        print(f"Error fetching block: {response.status_code}")
        return []

def get_transaction_details(tx_id):
    """Get raw transaction details for a transaction ID."""
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API_KEY,
    }
    data = {
        "jsonrpc": "2.0",
        "method": "getrawtransaction",
        "params": [tx_id],
        "id": 1
    }
    response = requests.post(API_URL, headers=headers, json=data)
    if response.status_code == 200:
        response_json = response.json()
        return response_json.get("result", "")
    else:
        print(f"Error fetching transaction {tx_id}: {response.status_code}")
        return ""

def get_wtxids():
    global block_hash
    block_hash = input("Enter the block hash: ")
    transactions = get_block_transactions(block_hash)
    double_hashed_results = ["0000000000000000000000000000000000000000000000000000000000000000"]
    
    for i, tx_id in enumerate(transactions[1:]):
        raw_tx = get_transaction_details(tx_id)
        if raw_tx:
            double_hashed = hash256(raw_tx)
            double_hashed_results.append(double_hashed)
            print(f"Transaction {i + 1}: {tx_id}")
    
    return double_hashed_results


def reverse_hex(hex_str):
    """Reverse the order of bytes in a hex string."""
    return bytes.fromhex(hex_str)[::-1].hex()


def hash256(hex_string):
    """Double SHA-256 hash of a hexadecimal string."""
    binary_data = bytes.fromhex(hex_string)
    hash1 = hashlib.sha256(binary_data).digest()
    hash2 = hashlib.sha256(hash1).digest()
    return hash2.hex()


class MerkleTree:
    def __init__(self, transactions):
        """Initialize the Merkle Tree with transactions."""
        self.leaves = [tx for tx in transactions]
        self.levels = []
        self.is_ready = False
        self.build_tree()

    def build_tree(self):
        """Build the Merkle tree and prepare levels."""
        if not self.leaves:
            self.is_ready = False
            return

        current_level = self.leaves.copy()
        self.levels.append(current_level)

        while len(current_level) > 1:
            new_level = []
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    combined = current_level[i] + current_level[i + 1]
                    new_level.append(hash256(combined))
                else:
                    combined = current_level[i] + current_level[i]
                    new_level.append(hash256(combined))
                    print(new_level)
            current_level = new_level
            self.levels.append(current_level)
        print(self.levels[-1][0])
        self.is_ready = True

    def get_proof(self, index):
        """Generate a Merkle proof for the specified transaction index."""
        if not self.is_ready or index < 0 or index >= len(self.leaves):
            return None
        print(self.levels)
        proof = []
        for x in range(0, len(self.levels) - 1):
            level_len = len(self.levels[x])

            # If it's the last node in an odd-length level
            if index == level_len - 1 and level_len % 2 == 1:
                # Include the node itself in the proof
                proof.append(self.levels[x][index])
                index = index // 2  # Move up the tree
                continue

            is_right_node = index % 2 == 1
            sibling_index = index - 1 if is_right_node else index + 1

            # Ensure sibling index is valid
            if 0 <= sibling_index < level_len:
                sibling_pos = "left" if is_right_node else "right"
                sibling_value = self.levels[x][sibling_index]
                proof.append(sibling_value)

            index //= 2  # Move up the tree

        return proof

    def get_merkle_root(self):
        """Return the Merkle root of the tree."""
        return self.levels[-1][0] if self.levels else None


# Example usage
if __name__ == "__main__":
    transactions = get_wtxids() # Block hash here, big endian

    # Create Merkle Tree
    merkle_tree = MerkleTree(transactions)

    # Specify the index of the transaction for which we want the Merkle proof
    index = 2

    wtxid = transactions[index]

    # Generate the Merkle proof
    proof = merkle_tree.get_proof(index)

    # Get the Merkle root
    merkle_root = merkle_tree.get_merkle_root()

    def sha256_hash(data):
        return hashlib.sha256(data).digest()

    wtxid_root = bytes.fromhex(merkle_root)
    zero_bytes = b"\x00" * 32
    wtxid_root_comm = sha256_hash(wtxid_root + zero_bytes)

    wtxid_root_comm = sha256_hash(wtxid_root_comm)

    # Print results
    # print(f"Merkle Root: {wtxid_root_comm.hex()}")
    # print(f"Merkle Proof: 0x{"".join(proof)}")

    print("====================================\n\n\n\n\n\n\n")
    print(f"Block Hash {reverse_hex(block_hash)}")
    print(f"Transaction wtxid: {wtxid}")
    print(f"Merkle Proof: 0x{"".join(proof)}")
    print(f"Index: {index}")
