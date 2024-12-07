import { useState } from "react";
import { toast } from "../../hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";

interface RequestDialogProps {
  request: {
    request_id: number;
    requestor: string;
    amount: string;
    created: string;
    status: string;
  };
  onSendBitcoin: () => Promise<void>;
  onClaimCBTC: (txHash: string) => Promise<void>;
}

const RequestDialog = ({ request, onSendBitcoin, onClaimCBTC }: RequestDialogProps) => {
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleClaimSubmit = async () => {
    if (!txHash) {
      toast({
        title: "Error",
        description: "Please enter transaction hash",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await onClaimCBTC(txHash);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBitcoin = async () => {
    setIsSending(true);
    try {
      await onSendBitcoin();
    } finally {
      setIsSending(false);
    }
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
            First send Bitcoin, then claim your CBTC using the transaction hash.
          </DialogDescription>
        </DialogHeader>

        {/* Request Details Card */}
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
            <p className="font-medium truncate">{request.requestor}</p>
          </div>
        </div>

        {/* Step 1: Send Bitcoin */}
        <div>
          <h4 className="text-sm font-medium mb-2">Step 1: Send Bitcoin</h4>
          <Button 
            onClick={handleSendBitcoin} 
            className="w-full" 
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Bitcoin'
            )}
          </Button>
        </div>

        <Separator className="my-2" />

        {/* Step 2: Claim CBTC */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Step 2: Claim CBTC</h4>
          <div className="space-y-2">
            <Label htmlFor="txHash">Bitcoin Transaction Hash</Label>
            <Input
              id="txHash"
              placeholder="Enter your Bitcoin transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleClaimSubmit} 
            disabled={!txHash || isLoading} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
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