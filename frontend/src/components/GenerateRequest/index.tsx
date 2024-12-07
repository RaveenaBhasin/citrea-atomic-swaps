import { useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";


declare global {
  interface Window {
    unisat?: any;
  }
}

// interface Request {
//   id: number;
//   created: string;
//   status: string;
//   btcAddress: string;
//   amount: string;
//   txHash?: string;
// }



const GenerateRequest = () => {
  const [btcAddress, setBtcAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 
  const [requests, setRequests] = useState([
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
      status: 'fulfilled',
      txHash: '0x123...abc',
      created: '2024-12-06'
    },
    {
        id: 3,
        btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        amount: '0.00001',
        status: 'pending',
        created: '2024-12-07'
      },
  ]);


  const btcToSatoshis = (btc: string): number => {
    return Math.floor(parseFloat(btc) * 100000000);
  };

  const handleSendBitcoin = async () => {
    if (!btcAddress || !amount) {
      toast({
        title: "Error",
        description: "Please enter both BTC address and amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
    
      if (typeof window.unisat === 'undefined') {
        throw new Error('UniSat wallet is not installed!');
      }

      
      const accounts = await window.unisat.requestAccounts();
      if (!accounts.length) {
        throw new Error('Please connect your UniSat wallet first');
      }

     
      const satoshis = btcToSatoshis(amount);

      
      const txId = await window.unisat.sendBitcoin(btcAddress, satoshis, {
        feeRate: 1 
      });

      setBtcAddress('');
      setAmount('');
      
      toast({
        title: "Transaction Sent",
        description: `Transaction ID: ${txId}`,
      });

      // Create a new request record
    //   onCreateRequest(btcAddress, amount);
    // !TODO handle request generation

    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send Bitcoin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFulfillRequest = (id:number) => {}
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Swap request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Bitcoin Address
                </label>
                <Input
                  placeholder="Enter BTC address"
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  disabled={isLoading}
                />
              </div> */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Amount (cBTC)
                </label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  step="0.00000001"
                  min="0"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSendBitcoin}
                disabled={isLoading}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your requests</CardTitle>
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
                    {request.status === 'pending' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={() => handleFulfillRequest(request.id)}
                      >
                        Unlock cBTC
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateRequest;