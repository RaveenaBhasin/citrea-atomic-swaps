import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Request {
  id: number;
  created: string;
  status: string;
  btcAddress: string;
  amount: string;
  txHash?: string;
}

interface DashboardProps {
  requests: Request[];
  onCreateRequest: (btcAddress: string, amount: string) => void;
  onFulfillRequest: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, onCreateRequest, onFulfillRequest }) => {
    const [btcAddress, setBtcAddress] = useState('');
    const [amount, setAmount] = useState('');
  
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Bitcoin Address
                  </label>
                  <Input
                    placeholder="Enter your BTC address"
                    value={btcAddress}
                    onChange={(e) => setBtcAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Amount (BTC)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    onCreateRequest(btcAddress, amount);
                    setBtcAddress('');
                    setAmount('');
                  }}
                >
                  Create Request
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Requests</CardTitle>
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
                          <span className="text-gray-600">Address:</span>{' '}
                          {request.btcAddress}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Amount:</span>{' '}
                          {request.amount} BTC
                        </p>
                        {request.txHash && (
                          <p className="text-sm">
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
                          onClick={() => onFulfillRequest(request.id)}
                        >
                          Fulfill Request
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


  export default Dashboard;
  