import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { calculateWtxidCommitment, hash256, reverseHex } from "../../utils/hashUtils";
import MerkleTree from "./MerkleTree";

interface Request {
  txId?: string;
  id: number;
  created: string;
  status: 'pending' | 'fulfilled' | 'readyToClaim' | 'claimed';
  btcAddress: string;
  amount: string;
  txHash?: string;
}


const CONFIG = {

  API_URL:"https://bitcoin-testnet4.gateway.tatum.io/",
  API_KEY:"t-67540735f66f7bf84a21a6cf-70c26b1b7ca7467fa46b64c1"
  
}

const FullFillRequests = () => {
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      amount: '0.5',
      status: 'pending',
      created: '2024-12-07'
    },
    {
      id: 2,
      btcAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      amount: '1.2',
      status: 'readyToClaim',
      txHash: '0x123...abc',
      created: '2024-12-06'
    },
    {
      id: 3,
      btcAddress: 'tb1p7me0q87r8jaqfyetpmxaj06rh2qdarfwjggwax37p9mn2ztnzsqsxvk78x',
      amount: '0.00001',
      status: 'pending',
      created: '2024-12-07'
    },
  ]);

  const btcToSatoshis = (btc: string): number => {
    return Math.floor(parseFloat(btc) * 100000000);
  };

  const handleFulfillRequest = async (request: Request) => {
    setIsLoading(prev => ({ ...prev, [request.id]: true }));
    try {
      if (typeof window.unisat === 'undefined') {
        throw new Error('UniSat wallet is not installed!');
      }

      // Get connected account
      const accounts = await window.unisat.requestAccounts();
      if (!accounts.length) {
        throw new Error('Please connect your UniSat wallet first');
      }

      // Convert amount to satoshis
      const satoshis = btcToSatoshis(request.amount);

      // Send Bitcoin transaction
      const txId = await window.unisat.sendBitcoin(request.btcAddress, satoshis, {
        feeRate: 1
      });


      
      console.log("txId",txId);

    handleClaimCBTC(txId)
      

      // Update request status
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === request.id
            ? { ...req, status: 'readyToClaim', txHash: txId }
            : req
        )
      );

      toast({
        title: "Transaction Successful",
        description: `Transaction Hash: ${txId}`,
      });

    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send Bitcoin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [request.id]: false }));
    }
  };







// ==========================================

interface BlockResponse {
  result?: {
      tx: string[];
  };
}

interface ApiConfig {
  API_URL: string;
  API_KEY: string;
}


interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

interface JsonRpcResponse {
  result: any;
  error?: {
      code: number;
      message: string;
  };
  id: number;
}

async function makeJsonRpcRequest(
  method: string,
  params: any[]
): Promise<JsonRpcResponse> {
  const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-api-key': CONFIG.API_KEY
  };

  const data: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: 1
  };

  try {
      const response = await axios.post<JsonRpcResponse>(
        CONFIG.API_URL,
          data,
          { headers }
      );
      return response.data;
  } catch (error: any) {
      if (axios.isAxiosError(error)) {
          throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
  }
}



async function getBlockTransactions(
  blockHash: string
): Promise<string[]> {
  try {
      const response = await makeJsonRpcRequest(
          'getblock',
          [blockHash]
      );
      
      if (!response.result?.tx) {
          throw new Error('Invalid block data received');
      }
      
      return response.result.tx;
  } catch (error) {
      console.error(`Error fetching block: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
  }
}

async function getTransactionDetails(
  txId: string
): Promise<string> {
  try {
      const response = await makeJsonRpcRequest(
          'getrawtransaction',
          [txId]
      );
  
      
      if (typeof response.result !== 'string') {
          throw new Error('Invalid transaction data received');
      }
      
      return response.result;
  } catch (error) {
      console.error(`Error fetching transaction ${txId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return '';
  }
}

async function getWtxids(blockHash:string): Promise<string[]> {
 
  const transactions = await getBlockTransactions(blockHash);
  const doubleHashedResults: string[] = [
      '0000000000000000000000000000000000000000000000000000000000000000'
  ];

  for (let i = 1; i < transactions.length; i++) {
      const txId = transactions[i];
      const rawTx = await getTransactionDetails(txId);
      
      if (rawTx) {
          const doubleHashed = hash256(rawTx); 
          doubleHashedResults.push(doubleHashed);
          console.log(`Transaction ${i}: ${txId}`);
      }
  }

  return doubleHashedResults;
}





// ==========================================










const handleClaimCBTC = async (txId:string) => {
  // setIsLoading(prev => ({ ...prev, [request.id]: true }));


  try {
    if (!txId) {
      throw new Error('Transaction ID is undefined');
    }

    const blockHash = await getTransactionDetails(txId);
    console.log("blockHash",blockHash);
    
    // const transactions = await getWtxids(blockHash);

    // console.log("transactions",transactions);
    // const tree = new MerkleTree(transactions);
    
    // const txnIndex = transactions.indexOf(txId);
    // const wtxid = transactions[txnIndex];
    // const proof = tree.getProof(txnIndex);
    // const root = tree.getMerkleRoot();

    // if (!proof || !root) {
    //   throw new Error('Failed to generate proof or root');
    // }

    // // Calculate wtxid commitment as in Python script
    // const wtxidCommitment = calculateWtxidCommitment(root);

    // // Format the final output
    // console.log("====================================\n");
    // console.log(`Block Hash: ${reverseHex(blockHash)}`);
    // console.log(`Transaction wtxid: ${wtxid}`);
    // console.log(`Merkle Proof: 0x${proof.join('')}`);
    // console.log(`Index: ${txnIndex}`);
    // console.log(`Wtxid Commitment: ${wtxidCommitment.toString('hex')}`);

    // Update request status
    // setRequests(prevRequests =>
    //   prevRequests.map(req =>
    //     req.id === request.id
    //       ? { ...req, status: 'claimed' }
    //       : req
    //   )
    // );

    toast({
      title: "CBTC Claimed",
      description: "Successfully claimed CBTC tokens",
    });

  } catch (error: any) {
    toast({
      title: "Claim Failed",
      description: error.message || "Failed to claim CBTC",
      variant: "destructive",
    });
  } finally {
    // setIsLoading(prev => ({ ...prev, [request.id]: false }));
  }
};

  const getRequestActionButton = (request: Request) => {
    const loading = isLoading[request.id];

    switch (request.status) {
      case 'pending':
        return (
          <Button 
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => handleFulfillRequest(request)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fulfilling...
              </>
            ) : (
              'Fulfill Request'
            )}
          </Button>
        );
      case 'readyToClaim':
        return (
          <Button 
            variant="default"
            size="sm"
            className="mt-4 w-full"
            onClick={() => handleFulfillRequest(request)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim CBTC'
            )}
          </Button>
        );
      case 'claimed':
        return (
          <div className="mt-4 text-center text-sm text-green-600">
            CBTC Claimed Successfully
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Request #{request.id}</p>
                      <p className="text-sm text-gray-600">{request.created}</p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'readyToClaim'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">To Address:</span>{' '}
                      {request.btcAddress}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Amount:</span>{' '}
                      {request.amount} BTC
                    </p>
                    {request.txHash && (
                      <p className="text-sm break-all">
                        <span className="text-gray-600">TX:</span>{' '}
                        {request.txHash}
                      </p>
                    )}
                  </div>
                  {getRequestActionButton(request)}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FullFillRequests;