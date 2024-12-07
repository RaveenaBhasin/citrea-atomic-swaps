import crypto from 'crypto';

function reverseHex(hexStr: string): string {
  
    if (!/^[0-9a-fA-F]*$/.test(hexStr) || hexStr.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }

    const bytes = hexStr.match(/.{2}/g) || [];
    return bytes.reverse().join('');
}

function hash256(hexString: string): string {
   
    if (!/^[0-9a-fA-F]*$/.test(hexString)) {
        throw new Error('Invalid hex string');
    }


    const binaryData = Buffer.from(hexString, 'hex');
    

    const hash1 = crypto.createHash('sha256').update(binaryData).digest();
    
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    
    return hash2.toString('hex');
}

function sha256Hash(data: Buffer): Buffer {
    return crypto.createHash('sha256').update(data).digest();
}

function calculateWtxidCommitment(merkleRoot: string): Buffer {
    const wtxidRoot = Buffer.from(merkleRoot, 'hex');
    const zeroBytes = Buffer.alloc(32, 0);
    
    let wtxidRootComm = sha256Hash(Buffer.concat([wtxidRoot, zeroBytes]));
    wtxidRootComm = sha256Hash(wtxidRootComm);
    
    return wtxidRootComm;
}


export { reverseHex, hash256,sha256Hash, calculateWtxidCommitment };
