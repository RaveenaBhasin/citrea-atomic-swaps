import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";


const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
const WalletInfo = ({
    // walletType,
    walletAddress,
    onDisconnect
  }: {
    // walletType: string;
    walletAddress: string;
    onDisconnect: () => void;
  }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">
              {walletAddress.startsWith("0x") ? 'MetaMask' : 'UniSat'}
            </span>
            <span className="text-sm font-mono">
              {truncateAddress(walletAddress)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="text-red-600 cursor-pointer"
            onClick={onDisconnect}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  export default WalletInfo;