
import { chain } from "../components/GenerateRequest";

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
  
 
  declare global {
    interface Window {
      ethereum?: any;
      unisat?: any;
    }
  }
  

  export { parseStatus, switchToChain };