import { Outlet } from "react-router-dom";
import Header from "../header";

const Layout = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </main>
        <footer className="border-t p-4 mt-auto">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
            Citrea Atomic Swaps © {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    );
  };
  
  export default Layout;