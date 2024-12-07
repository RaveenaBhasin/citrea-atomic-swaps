import { ArrowRightLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate()
  return (
    <div className="bg-gradient-to-b h-screen from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Atomic Swaps Made Simple
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Seamlessly swap between Bitcoin and Citrea tokens with trustless atomic swaps

          </p>
          <div className="flex gap-4 items-center justify-center">

         
         
          <Button size="lg" onClick={() => {
            navigate("/gen-requests")
          }}>
            Generate requests
            <ArrowRightLeft className="ml-2 h-4 w-4" />
          </Button>

          <Button size="lg" onClick={() => {
            navigate("/view-requests")
          }}>
            View & Fullfill requests
            <ArrowRightLeft className="ml-2 h-4 w-4" />
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Hero;