import { useAtom } from "jotai";

declare global {
    interface Window {
        ethereum?: any;
        unisat?: any;
    }
}


import { isWalletModalOpenAtom, walletAddressAtom, walletTypeAtom } from "../../atoms";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Bitcoin, Wallet } from "lucide-react";
const WalletModal = () => {
    const [, setWalletType] = useAtom(walletTypeAtom);
    const [, setWalletAddress] = useAtom(walletAddressAtom);
    const [isOpen, setIsOpen] = useAtom(isWalletModalOpenAtom);

    const connectMetaMask = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                setWalletAddress(accounts[0]);
                setWalletType('metamask');
                setIsOpen(false);
            } else {
                alert('MetaMask is not installed!');
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    };

    const connectUniSat = async () => {
        try {
            if (typeof window.unisat !== 'undefined') {
                await window.unisat.switchChain('BITCOIN_TESTNET4');

                const accounts = await window.unisat.requestAccounts();
                setWalletAddress(accounts[0]);
                setWalletType('unisat');
                setIsOpen(false);
            } else {
                alert('UniSat Wallet is not installed!');
            }
        } catch (error) {
            console.error('Error connecting to UniSat:', error);
        }
    };

    

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                    <Button
                        variant="outline"
                        className="w-full p-6"
                        onClick={connectMetaMask}
                    >
                        <Wallet className="mr-2 w-4 h-4" />
                        MetaMask (for Citrea)
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full p-6"
                        onClick={connectUniSat}
                    >
                        <Bitcoin className="mr-2 w-4 h-4" />
                        Unisat (for Bitcoin)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default WalletModal;