import { Bitcoin, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface WalletSelectionProps {
  onConnect: (walletType: string) => void;
}

const WalletSelection = ({ onConnect }: WalletSelectionProps) => {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Connect Your Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full py-6 flex items-center justify-center space-x-4"
            onClick={() => onConnect('metamask')}
          >
            <Wallet className="h-5 w-5" />
            <span>MetaMask</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full py-6 flex items-center justify-center space-x-4"
            onClick={() => onConnect('unisat')}
          >
            <Bitcoin className="h-5 w-5" />
            <span>Unisat Wallet</span>
          </Button>
        </CardContent>
      </Card>
    );
  };
  

  export default WalletSelection;