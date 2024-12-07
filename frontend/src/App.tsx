import { useState } from "react";
import Header from "./components/header";
import Hero from "./components/hero";
import WalletSelection from "./components/walletselect";
import Dashboard from "./components/dashboard";

const App = () => {
  const [connected, setConnected] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [showTradingDashboard, setShowTradingDashboard] = useState(false);
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
    }
  ]);

  interface Request {
    id: number;
    btcAddress: string;
    amount: string;
    status: 'pending' | 'fulfilled';
    created: string;
    txHash?: string;
  }

  const handleConnect = (type: string) => {
    setWalletType(type);
    setConnected(true);
    setShowTradingDashboard(true);
  };



  const handleCreateRequest = (btcAddress: string, amount: string) => {
    const newRequest: Request = {
      id: requests.length + 1,
      btcAddress,
      amount,
      status: 'pending',
      created: new Date().toISOString().split('T')[0]
    };
    setRequests([newRequest, ...requests]);
  };

  const handleFulfillRequest = (id:number) => {
    setRequests(requests.map(req => 
      req.id === id 
        ? { ...req, status: 'fulfilled', txHash: '0x' + Math.random().toString(16).slice(2) }
        : req
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header connected={connected} walletType={walletType} />
      
      {!showTradingDashboard ? (
        <>
          <Hero onGetStarted={() => setShowTradingDashboard(true)} />
          {!connected && showTradingDashboard && (
            <div className="container mx-auto px-4 py-8">
              <WalletSelection onConnect={handleConnect} />
            </div>
          )}
        </>
      ) : (
        <>
          {!connected ? (
            <div className="container mx-auto px-4 py-8">
              <WalletSelection onConnect={handleConnect} />
            </div>
          ) : (
            <Dashboard 
              requests={requests}
              onCreateRequest={handleCreateRequest}
              onFulfillRequest={handleFulfillRequest}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;