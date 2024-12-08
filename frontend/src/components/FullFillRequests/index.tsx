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
import { Bitcoin, Inbox, Loader2, RefreshCw } from "lucide-react";


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
      {/* Main Card with glass effect */}
      <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        {/* Header Section */}
        <div className="p-6 border-b border-blue-100 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Active Swaps
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-sm text-blue-600 font-medium">
                  {requests?.length || 0} Active
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-500" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Bitcoin className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="mt-4 text-gray-500 animate-pulse">Loading swaps...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Swaps</h3>
              <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                There are no active swap requests at the moment. Check back later or refresh.
              </p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-blue-200 hover:bg-blue-50"
                disabled={isRefreshing}
              >
                Refresh List
              </Button>
            </div>
          ) : (
            <div className="relative">
              {isRefreshing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500" />
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {requests.map((request) => (
                  <div
                    key={request.request_id}
                    className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <h3 className="font-medium text-gray-900">
                              {request.requestor.slice(0, 6)}...{request.requestor.slice(-4)}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <p>{request.created.relative}</p>
                            <p className="text-xs opacity-75">{request.created.full}</p>
                          </div>
                        </div>
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${request.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }
                        `}>
                          {request.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Amount</span>
                          <div className="flex items-center gap-2">
                            <Bitcoin className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-blue-600">
                              {request.amount} cBTC
                            </span>
                          </div>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="mt-4">
                          <RequestDialog
                            request={request}
                            onSendBitcoin={handleSendBitcoin}
                            onClaimCBTC={handleClaimCBTC}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default FullFillRequests;