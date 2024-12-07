import { useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import RequestDialog from "./RequestModal";
import { ethers } from "ethers";
import { chain, CONTRACT_ADDRESS } from "../GenerateRequest";
import { abi } from '../../abi/abi.json'
import { getVerificationDetails } from "../../utils/verifications";


const FullFillRequests = () => {
  const [requests, setRequests] = useState<{
    request_id: number;
    requestor: string;
    amount: string;
    created: string;
    status: string;
  }[]>([]);

  const handleSendBitcoin = async () => {
    try {
      if (typeof window.unisat === 'undefined') {
        throw new Error('UniSat wallet is not installed!');
      }

      const accounts = await window.unisat.requestAccounts();
      if (!accounts.length) {
        throw new Error('Please connect your UniSat wallet first');
      }

      // Add your Bitcoin sending logic here
      toast({
        title: "Transaction Started",
        description: "Please confirm the transaction in your wallet",
      });

    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send Bitcoin",
        variant: "destructive",
      });
    }
  };

  const handleClaimCBTC = async (txHash: string) => {
    try {
      const response = await axios.get(
        `https://mempool.space/testnet4/api/tx/${txHash}`
      );

      const blockhash = response.data.status.confirmed
        ? response.data.status.block_hash
        : null;

      if (!blockhash) {
        throw new Error("Transaction not confirmed yet");
      }


      console.log("processing blockhash", blockhash);
      
      const {
        blockHash,
        wtxid,
        proof,
        index
      } = await getVerificationDetails(blockhash,txHash);

      console.log("blockHash", blockHash);
      console.log("wtxid", wtxid);
      console.log("proof", proof);
      console.log("index", index);

      

      // const transactions = await getWtxids(blockhash);

      // Add your CBTC claiming logic here
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
    }
  };

  const parseStatus = (statusCode: number): string => {


    switch (Number(statusCode)) {
      case 0:
        return 'fulfilled';
      case 1:
        return 'pending';
      case 2:
        return 'revoked';
        
      default:
        return 'unknown';
    }
  };


  const getRequests = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        provider
      );

      const allRequests: any = [];

      for (let i = 0; i < 4; i++) {
        try {
          const result = await contract.getRequest(i);





          if (result.amount.toString() !== "0") {

            console.log("result", result);

            allRequests.push({
              request_id: i,
              requestor: result[0],
              amount: ethers.formatEther(result[1]),
              created: new Date(Number(result[2]) * 1000).toLocaleDateString(),
              status: parseStatus(result[3])
            });
          }
        } catch (err) {

          console.log(`No more requests after ${i}`);
          break;
        }
      }

      console.log("All requests", allRequests);


      setRequests(allRequests.reverse());


    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    getRequests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>All Requests</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={getRequests}
              className="text-sm"
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No requests found</p>
            ) : (
              requests.map((request) => (
                <Card
                  key={request.request_id}
                  className="bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div>
                        <p className="font-medium truncate max-w-[200px]">
                          {request.requestor}
                        </p>
                        <p className="text-sm text-gray-600">{request.created}</p>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{request.amount} cBTC</span>
                      </p>
                    </div>
                    {request.status === 'pending' && (
                      <RequestDialog
                        request={request}
                        onSendBitcoin={handleSendBitcoin}
                        onClaimCBTC={handleClaimCBTC}
                      />
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default FullFillRequests;