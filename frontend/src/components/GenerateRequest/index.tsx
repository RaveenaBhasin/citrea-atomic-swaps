import { Loader2, RefreshCw, Wallet, Lock, Bitcoin, Inbox } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
// import { toast } from "../../hooks/use-toast";
import { ethers } from "ethers";
import { abi } from "../../abi/abi.json";
import { useAtom } from "jotai";
import { walletAddressAtom } from "../../atoms";

import { toast } from 'react-toastify';
import { formatDateTime } from "../../utils/time";
interface Request {
  requestor: string;
  amount: string;
  created: {
    full: string;
    relative: string;
  };
  status: string;
}

export const chain = {
  id: 5115,
  name: 'Citrea Testnet',
  network: 'citrea-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Citrea Bitcoin',
    symbol: 'cBTC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
    public: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
};


interface RequestCardProps {
  request: Request;
  onUnlock?: () => void;
}

const RequestCard = ({ request, onUnlock }: RequestCardProps) => {
  return (
    <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <div>
            <p className="font-medium  max-w-[300px]">{
              
              request.requestor.slice(0, 7) + "......" + request.requestor.slice(-7)
              
              }</p>
              <div className="text-sm text-gray-600">
              <p>{request.created.relative}</p>
              <p className="text-xs">{request.created.full}</p>
            </div>
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
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full hover:bg-primary hover:text-white transition-colors"
            onClick={onUnlock}
          >
            Unlock cBTC
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
interface GenerateRequestFormProps {
  amount: string;
  btcAddress: string; 
  isLoading: boolean;
  onAmountChange: (value: string) => void;
  onBtcAddressChange: (value: string) => void;
  onSubmit: () => void;
}



const GenerateRequestForm = ({
  amount,
  btcAddress,
  isLoading,
  onAmountChange,
  onBtcAddressChange,
  onSubmit
}: GenerateRequestFormProps) => {
  const [address, setWalletAddress] = useAtom(walletAddressAtom);
  const [, setWalletType] = useAtom(walletAddressAtom);

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletType('metamask');
        setWalletAddress(accounts[0]);
      } else {
        alert('MetaMask is not installed!');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Generate Swap Request</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Amount (cBTC)
            </label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              disabled={isLoading}
              step="0.00000001"
              min="0"
              className="focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Bitcoin Address
            </label>
            <Input
              type="text"
              placeholder="Enter Bitcoin address"
              value={btcAddress}
              onChange={(e) => onBtcAddressChange(e.target.value)}
              disabled={isLoading}
              className="focus:ring-2 focus:ring-primary"
            />
          </div>
          {!address ? (
            <Button
              className="w-full"
              onClick={connectMetaMask}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              className="w-full transition-all transform hover:scale-[1.02]"
              onClick={onSubmit}
              disabled={isLoading || !btcAddress.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Lock cBTC'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export const CONTRACT_ADDRESS = "0x29f5054129deefae63add822f325d78da70a2b6f";



const GenerateRequest = () => {
  const [amount, setAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRequests, setIsFetchingRequests] = useState(false);
  const [address, setWalletAddress] = useAtom(walletAddressAtom)
  const [, setWalletType] = useAtom(walletAddressAtom)
  const [requests, setRequests] = useState<Request[]>([]);


  const switchToChain = async () => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask");
    }

    const chainIdHex = `0x${chain.id.toString(16)}`;

    try {

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {

      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls.public.http,
              },
            ],
          });
        } catch (addError) {
          throw new Error("Failed to add network");
        }
      } else {
        throw switchError;
      }
    }
  };

  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );




  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletType('metamask');
        setWalletAddress(accounts[0]);


      } else {
        alert('MetaMask is not installed!');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };


  const handleGenerateRequest = async () => {
    if (!amount) {
      toast("Please enter amount");
      return;
    }

    if (!btcAddress) {
      toast("Please enter Bitcoin address");
      return;
    }
    setIsLoading(true);
    try {


      if (!address) {
        await connectMetaMask();
      }
      await switchToChain();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();


      const contracts = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        signer
      );


      const parsedAmount = ethers.parseEther(amount);

      const result = await contracts[
        "generateRequest"
      ](parsedAmount,btcAddress, {
        value: parsedAmount,
      });


      console.log(result);

      getRequests();

      setBtcAddress("");
      setAmount("");


    } catch (error: any) {
      console.error("Transaction error:", error);
      toast("Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };



  const getRequests = async () => {
    if (!address) return;
    try {
      setIsFetchingRequests(true);
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



          console.log("result[0] === address", result[0]?.toLowerCase() == address?.toLowerCase(), result[0]?.toLowerCase(), address?.toLowerCase());


          if (result.amount.toString() !== "0" && address && result[0]?.toLowerCase() == address.toLowerCase()) {

            console.log("result", result);

            allRequests.push({
              requestor: result[0],
              btcAddr:  result[1],
              amount: ethers.formatEther(result[2]),
              created: formatDateTime(Number(result[3])),
              status: parseStatus(result[4])
            });
          }
        } catch (err) {

          console.log(`No more requests after ${i}`);
          break;
        }finally{
          setIsFetchingRequests(false);
        }
      }

      console.log("All requests", allRequests);


      setRequests(allRequests.reverse());


    } catch (error) {
      console.error("Error fetching requests:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to fetch requests",
      //   variant: "destructive",
      // });

      toast.error("Failed to fetch requests");
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

  useEffect(() => {
    if (address) {
      getRequests();
    }
  }, [address]);
  // const getAndFilterRequestsForUser = async () => {
  //   const requests = await getRequests();
  //   // const userRequests = requests.filter((request) => request.btcAddress === btcAddress);
  //   // setRequests(userRequests);
  // }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="grid md:grid-cols-2 gap-8">
      
        <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          <div className="p-6 border-b border-blue-100 bg-white">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Generate Swap
              </h2>
              <div className="px-3 py-1 bg-blue-50 rounded-full">
                <span className="text-sm text-blue-600 font-medium">
                  Lock cBTC
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Amount (cBTC)
                </label>
                <div className="mt-1 relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                    step="0.00000001"
                    min="0"
                    className="pl-4 pr-12 py-3 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-xl"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-500 text-sm">cBTC</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Bitcoin Address
                </label>
                <Input
                  type="text"
                  placeholder="Enter Bitcoin address"
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  disabled={isLoading}
                  className="py-3 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-xl"
                />
              </div>

              {!address ? (
                <Button
                  className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium"
                  onClick={connectMetaMask}
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect MetaMask
                </Button>
              ) : (
                <Button
                  className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  onClick={handleGenerateRequest}
                  disabled={isLoading || !btcAddress.trim() || !amount}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Lock cBTC
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          <div className="p-6 border-b border-blue-100 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Your Swaps
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm text-blue-600 font-medium">
                    {requests.length} Active
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={getRequests}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                disabled={isFetchingRequests}
              >
                {isFetchingRequests ? (
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

          <div className="p-6">
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {!address ? (
                <div className="text-center py-16">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Not Connected</h3>
                  <p className="text-gray-500 mb-4">Connect your wallet to view your swaps</p>
                  <Button
                    onClick={connectMetaMask}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Connect Wallet
                  </Button>
                </div>
              ) : isFetchingRequests ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-500" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Bitcoin className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <p className="mt-4 text-gray-500 animate-pulse">Loading your swaps...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Swaps Yet</h3>
                  <p className="text-gray-500">Start by generating a new swap request</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <p className="font-medium">
                              {request.requestor.slice(0, 6)}...{request.requestor.slice(-4)}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <p>{request.created.relative}</p>
                            <p className="text-xs">{request.created.full}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateRequest;