import { useState } from "react";
import Hero from "./components/hero";

import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Layout from "./components/layout";
import GenerateRequest from "./components/GenerateRequest";
import FullFillRequests from "./components/FullFillRequests";

const App = () => {
  // const [connected, setConnected] = useState(false);
  const [, setWalletType] = useState('');

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

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Hero />} />
        <Route path="generate-requests" element={<GenerateRequest/>}/>

        <Route path="view-requests" element={<FullFillRequests/>}/>
        
   
      </Route>
    </Routes>
  );
};

export default App;