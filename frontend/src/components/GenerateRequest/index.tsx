import { Loader2 } from "lucide-react";
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
        <GenerateRequestForm
          amount={amount}
          btcAddress={btcAddress}
          isLoading={isLoading}
          onAmountChange={setAmount}
          onBtcAddressChange={setBtcAddress}
          onSubmit={handleGenerateRequest}
        />

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl flex items-center justify-between">
              Your Requests ({requests.length})
              <Button
                variant="ghost"
                size="sm"
                onClick={getRequests}
                className="text-sm"
                disabled={isFetchingRequests}
              >
                {isFetchingRequests ? 
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div> : 
                  'Refresh'
                }
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {!address ? (
                <div className="text-center py-8">
                  Connect your wallet to view requests
                </div>
              ) : isFetchingRequests ? (
                <LoadingState />
              ) : requests?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No requests found</p>
              ) : (
                requests?.map((request, index) => (
                  <RequestCard
                    key={index}
                    request={request}
                    onUnlock={() => {}}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

};

export default GenerateRequest;