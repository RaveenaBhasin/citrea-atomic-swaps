import { Outlet } from "react-router-dom";
import Header from "../header";

const Layout = () => {
  return (
    <div className="min-h-screen relative bg-gradient-to-b from-blue-50/50 via-white to-blue-50/50">
     
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div 
          className="absolute -left-64 -top-64 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"
         
        />
        <div 
          className="absolute -right-64 top-1/3 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"
         
        />
      </div>

      <div className="relative flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </main>

        <footer className="mt-auto border-t border-blue-100/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Citrea Atomic Swaps © {new Date().getFullYear()}
              </div>
              
              <div className="flex items-center gap-6">
                <a 
                  href="https://docs.citrea.xyz" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Documentation
                </a>
                <a 
                  href="https://twitter.com/citreabtc" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Twitter
                </a>
                <a 
                  href="https://github.com/citrea" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;