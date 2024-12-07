import { useState } from "react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader2, Copy } from "lucide-react";
import { Separator } from "../ui/separator";
import { useAtom } from "jotai";
import { walletAddressAtom, walletTypeAtom } from "../../atoms";

interface RequestDialogProps {
  request: {
    request_id: number;
    btcAddr: string;
    requestor: string;
    amount: string;
    created: {
      full: string;
      relative: string;
    };
    status: string;
  };
  onSendBitcoin: (request: {
    request_id: number;
    btcAddr: string;
    requestor: string;
    amount: string;
    created: {
      full: string;
      relative: string;
    };
    status: string;
  }) => Promise<string | void>;
  onClaimCBTC: (txHash: string, id: number) => Promise<void>;
}

const RequestDialog = ({ request, onSendBitcoin, onClaimCBTC }: RequestDialogProps) => {
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUnisatConnecting, setIsUnisatConnecting] = useState(false);
  const [isMetamaskConnecting, setIsMetamaskConnecting] = useState(false);
  const [unisatConnected, setUnisatConnected] = useState(false);
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [sentTxId, setSentTxId] = useState('');
  const [, setWalletType] = useAtom(walletTypeAtom);
  const [, setWalletAddress] = useAtom(walletAddressAtom);

  const connectUniSat = async () => {
    setIsUnisatConnecting(true);
    try {
      if (typeof window.unisat === 'undefined') {
        toast.error('UniSat wallet is not installed!');
        return;
      }
      await window.unisat.switchChain('BITCOIN_TESTNET4');
      const accounts = await window.unisat.requestAccounts();
      setUnisatConnected(true);
      setWalletType('unisat');
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error('Error connecting to UniSat:', error);
      toast.error('Failed to connect to UniSat wallet');
    } finally {
      setIsUnisatConnecting(false);
    }
  };

  const connectMetaMask = async () => {
    setIsMetamaskConnecting(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed!');
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setMetamaskConnected(true);
      setWalletType('metamask');
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      toast.error('Failed to connect to MetaMask');
    } finally {
      setIsMetamaskConnecting(false);
    }
  };

  const handleSendBitcoin = async () => {
    if (!unisatConnected) {
      await connectUniSat();
      return;
    }
    setIsSending(true);
    try {
      const result = await onSendBitcoin(request);
      if (result) {
        setSentTxId(result);
        setTxHash(result);
      }
    } catch (error) {
      console.error('Error sending Bitcoin:', error);
      toast.error('Failed to send Bitcoin');
    } finally {
      setIsSending(false);
    }
  };

  const handleClaimSubmit = async () => {
    if (!metamaskConnected) {
      await connectMetaMask();
      return;
    }

    if (!txHash) {
      toast.error("Please enter transaction hash");
      return;
    }
    setIsLoading(true);
    try {
      await onClaimCBTC(txHash, request.request_id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTxId = () => {
    navigator.clipboard.writeText(sentTxId);
    toast.success('Transaction ID copied to clipboard!');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full hover:bg-primary hover:text-white transition-colors"
        >
          Open Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            First send Bitcoin using UniSat wallet, then claim your CBTC using MetaMask.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Amount</Label>
              <p className="font-medium">{request.amount} cBTC</p>
            </div>
            <div>
              <Label className="text-gray-600">Status</Label>
              <p className="font-medium capitalize">{request.status}</p>
            </div>
          </div>
          <div className="mt-2">
            <Label className="text-gray-600">Requestor</Label>
            <p className="font-medium text-sm break-all">{request.requestor}</p>
          </div>
          <div className="mt-2">
            <Label className="text-gray-600">Bitcoin Address</Label>
            <p className="font-medium text-sm break-all">{request.btcAddr}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Step 1: Send Bitcoin (UniSat)</h4>
          <Button 
            onClick={handleSendBitcoin} 
            className="w-full" 
            disabled={isSending || isUnisatConnecting}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Bitcoin...
              </>
            ) : isUnisatConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to UniSat...
              </>
            ) : !unisatConnected ? (
              'Connect UniSat'
            ) : (
              'Send Bitcoin'
            )}
          </Button>

          {sentTxId && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md border">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-600">Transaction ID:</Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCopyTxId}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm font-mono mt-1 break-all">{sentTxId}</p>
              <p className="text-xs text-gray-500 mt-2">
                Transaction ID has been auto-filled below for claiming
              </p>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Step 2: Claim CBTC (MetaMask)</h4>
          <div className="space-y-2">
            <Label htmlFor="txHash">Bitcoin Transaction Hash</Label>
            <Input
              id="txHash"
              placeholder="Enter your Bitcoin transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              disabled={isLoading || isMetamaskConnecting}
            />
          </div>
          <Button 
            onClick={handleClaimSubmit} 
            disabled={isLoading || isMetamaskConnecting || !txHash} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming CBTC...
              </>
            ) : isMetamaskConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to MetaMask...
              </>
            ) : !metamaskConnected ? (
              'Connect MetaMask'
            ) : (
              'Claim CBTC'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDialog;