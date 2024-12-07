import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import RequestDialog from "./RequestModal";
import { ethers } from "ethers";
import { chain, CONTRACT_ADDRESS } from "../GenerateRequest";
import { abi } from '../../abi/abi.json'
import { getVerificationDetails } from "../../utils/verifications";
import { useAtom } from "jotai";
import { walletAddressAtom } from "../../atoms";
import { formatDateTime } from "../../utils/time";
import { parseStatus } from "../../utils/chain";
import { Loader2 } from "lucide-react";


const FullFillRequests = () => {
  const [address, setWalletAddress] = useAtom(walletAddressAtom);
  const [, setWalletType] = useAtom(walletAddressAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [requests, setRequests] = useState<{
    request_id: number;
    btcAddr: string;
    requestor: string;
    amount: string;
    created: {
      full: string;
      relative: string;
    };
    status: string;
  }[]>([]);


  const getRequests = async (isRefreshing = false) => {
    if (!isRefreshing) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        provider
      );

      const allRequests: any = [];

      for (let i = 0; i < 10; i++) {
        try {
          const result = await contract.getRequest(i);
          if (result.amount.toString() !== "0") {
            allRequests.push({
              request_id: i,
              requestor: result[0],
              btcAddr: result[1],
              amount: ethers.formatEther(result[2]),
              created: formatDateTime(Number(result[3])),
              status: parseStatus(result[4])
            });
          }
        } catch (err) {
          console.log(`No more requests after ${i}`);
          break;
        }
      }

      setRequests(allRequests.reverse());
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  const handleRefresh = () => {
    getRequests(true);
  };


  const connectUniSat = async () => {
    try {
        if (typeof window.unisat !== 'undefined') {
            await window.unisat.switchChain('BITCOIN_TESTNET4');

            const accounts = await window.unisat.requestAccounts();
            setWalletAddress(accounts[0]);
            setWalletType('unisat');
            // setIsOpen(false);
        } else {
            alert('UniSat Wallet is not installed!');
        }
    } catch (error) {
        console.error('Error connecting to UniSat:', error);
    }
};

  const handleSendBitcoin = async (request: {
    request_id: number;
    btcAddr: string;
    requestor: string;
    amount: string;
    created: {
      full: string;
      relative: string;
    };
    status: string;
  }) => {
    try {

      console.log("req", request);

      if (typeof window.unisat === 'undefined') {
        throw new Error('UniSat wallet is not installed!');
      }

      await connectUniSat();
      const accounts = await window.unisat.requestAccounts();
      if (!accounts.length) {
        throw new Error('Please connect your UniSat wallet first');
      }

      console.log("accounts", accounts);

      
        let txid = await window.unisat.sendBitcoin(request.btcAddr,
          1000
        );

        toast.info("Transaction Started. Please confirm the transaction in your wallet");
        return txid;




      // toast({
      //   title: "Transaction Started",
      //   description: "Please confirm the transaction in your wallet",
      // });
      

    } catch (error: any) {
      // toast({
      //   title: "Transaction Failed",
      //   description: error.message || "Failed to send Bitcoin",
      //   variant: "destructive",
      // });
      toast.error(error.message || "Failed to send Bitcoin");
    }
  };


  const connectMetaMask = async () => {
    try {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            setWalletAddress(accounts[0]);
            setWalletType('metamask');
            
        } else {
            alert('MetaMask is not installed!');
        }
    } catch (error) {
        console.error('Error connecting to MetaMask:', error);
    }
};

  const handleClaimCBTC = async (txHash: string, id: number) => {
    try {
      const response = await axios.get(
        `https://mempool.space/testnet4/api/tx/${txHash}`
      );

      const blockhash = response.data.status.confirmed
        ? response.data.status.block_hash
        : null;


      const blockHeight = response.data.status.block_height

      if (!blockhash) {
        throw new Error("Transaction not confirmed yet");
      }


      console.log("processing blockhash", response.data);

      const {
        blockHash,
        wtxid,
        proof,
        index
      } = await getVerificationDetails(blockhash, txHash);

      console.log("blockHash", blockHash);
      // console.log("wtxid", wtxid);
      // console.log("proof", proof);
      // console.log("index", index);

      if (!address) {
        await connectMetaMask();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();


      const contracts = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        signer
      );



      console.log(
        "id",
        id,
        "blockHeight",
        blockHeight,
        "wtxid",
        wtxid,
        "proof",
        proof,
        "index",
        index
      );

      // Convert wtxid to bytes32
      const wtxidBytes32 = `0x${wtxid}`;

      // Convert proof to bytes
      const proofBytes = `0x${proof}`;



      const tx = await contracts.fullfill(
        id,                 // _requestId: uint256
        blockHeight,        // _blockNumber: uint256
        wtxidBytes32,       // _wtxId: bytes32
        proofBytes,         // _proof: bytes
        index              // _index: uint256
      );

      // toast({
      //   title: "CBTC Claimed",
      //   description: "Transaction submitted successfully. Waiting for confirmation...",
      // });

      toast.info("Transaction submitted successfully. Waiting for confirmation...");

      console.log("tx", tx);


      await tx.wait(1)





      // const transactions = await getWtxids(blockhash);

      // Add your CBTC claiming logic here
      // toast({
      //   title: "CBTC Claimed",
      //   description: "Successfully claimed CBTC tokens",
      // });

      toast.success("Successfully claimed CBTC tokens");

    } catch (error: any) {
      // toast({
      //   title: "Claim Failed",
      //   description: error.message || "Failed to claim CBTC",
      //   variant: "destructive",
      // });

      toast.error(error.message || "Failed to claim CBTC");
    }
  };




  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-lg">All Requests ({requests?.length})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-sm"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-500">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No requests found</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-2"
                    disabled={isRefreshing}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 relative">
                  {isRefreshing && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {requests.map((request) => (
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
                            <div className="text-sm text-gray-600">
                              <p>{request.created.relative}</p>
                              <p className="text-xs">{request.created.full}</p>
                            </div>
                          </div>
                          <span className={`text-sm px-2 py-1 rounded ${
                            request.status === 'pending'
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
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export default FullFillRequests;