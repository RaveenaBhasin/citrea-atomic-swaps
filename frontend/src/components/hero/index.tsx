import { ArrowRightLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-blue-50">
     
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
       
          

       
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Atomic Swaps Made Simple
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Seamlessly swap between Bitcoin and Citrea tokens with trustless atomic swaps.
           
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button 
              size="lg" 
              className="group relative px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => navigate("/generate-requests")}
            >
              <span className="flex items-center">
                Generate Requests
                <ArrowRightLeft className="ml-2 h-5 w-5 transform group-hover:rotate-180 transition-transform duration-300" />
              </span>
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="group relative px-8 py-6 border-2 border-blue-500 hover:bg-blue-50 transition-all duration-300"
              onClick={() => navigate("/view-requests")}
            >
              <span className="flex items-center">
                View & Fulfill Requests
                <ArrowRightLeft className="ml-2 h-5 w-5 transform group-hover:rotate-180 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: "Trustless",
                description: "No intermediaries or centralized parties involved in the swap process"
              },
              {
                title: "Secure",
                description: "Cryptographically secured transactions with atomic guarantees"
              },
              {
                title: "Efficient",
                description: "Fast and cost-effective cross-chain token swaps"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-blue-100 hover:border-blue-200 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-2 text-blue-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;