import { useState } from "react";

declare global {
  interface Window {
    unisat?: any;
  }
}
import { Button } from "../ui/button";
import { Bitcoin, Menu, X } from "lucide-react";

interface HeaderProps {
  connected: boolean;
  walletType: string;
}

const Header = ({ connected, walletType }: HeaderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const connectUniSat = async () => {
        if (typeof window.unisat !== 'undefined') {
            console.log('UniSat Wallet is installed!');

            let accounts = await window.unisat.requestAccounts();
            console.log('connect success', accounts);
          } else {
            console.log('UniSat Wallet is not installed!');
          }
    }


  
    return (
      <header className="border-b">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Bitcoin className="h-6 w-6 text-yellow-500" />
              <span className="font-bold">Citrea Atomic Swaps</span>
            </div>
  
            <nav className="hidden md:flex items-center  ">
            <Button variant="link">Home</Button>
            <Button variant="link">Swap</Button>
              {connected ? (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Connected to {walletType}</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={connectUniSat}>Connect Wallet</Button>
              )}
            </nav>
  
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="container mx-auto px-4 space-y-4">
            <Button variant="link" className="w-full">Home</Button>
            <Button variant="link" className="w-full">Swap</Button>
              {connected ? (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Connected to {walletType}</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full">Connect Wallet</Button>
              )}
            </div>
          </div>
        )}
      </header>
    );
  };
  

  export default Header;