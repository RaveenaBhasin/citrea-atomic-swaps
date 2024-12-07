import { useState } from "react";

declare global {
  interface Window {
    unisat?: any;
  }
}
import { Button } from "../ui/button";
import { Bitcoin, LogOut, Menu, X } from "lucide-react";
import { useAtom } from "jotai";
import { isWalletModalOpenAtom, walletAddressAtom, walletTypeAtom } from "../../atoms";
import WalletModal from "../walletmodal";
import WalletInfo from "../walletinfo";



const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletType, setWalletType] = useAtom(walletTypeAtom);
  const [walletAddress, setWalletAddress] = useAtom(walletAddressAtom);
  const [, setIsWalletModalOpen] = useAtom(isWalletModalOpenAtom);


    const handleDisconnect = async () => {
      try {
        if (walletType === 'metamask') {
          // MetaMask doesn't have a disconnect method, just clear the state
        } else if (walletType === 'unisat') {
          // Check if UniSat has a disconnect method
          if (window.unisat && typeof window.unisat.disconnect === 'function') {
            await window.unisat.disconnect();
          }
        }
        // Clear the wallet state
        setWalletType(null);
        setWalletAddress(null);
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    };
  
    return (
      <>
      <nav className="border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bitcoin className="w-6 h-6" />
            <span className="font-bold">Citrea Atomic Swaps</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="link">Home</Button>
            <Button variant="link">Swap</Button>
            {walletAddress ? (
              <WalletInfo
                walletType={walletType!}
                walletAddress={walletAddress}
                onDisconnect={handleDisconnect}
              />
            ) : (
              <Button onClick={() => setIsWalletModalOpen(true)}>
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Button variant="link" className="w-full">Home</Button>
            <Button variant="link" className="w-full">Swap</Button>
            {walletAddress ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDisconnect}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </Button>
            ) : (
              <Button 
                className="w-full"
                onClick={() => setIsWalletModalOpen(true)}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        )}
      </nav>
      <WalletModal />
    </>
    );
  };
  

  export default Header;