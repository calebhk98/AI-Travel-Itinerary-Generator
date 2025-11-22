import React from 'react';
import { Map, Compass, CheckCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Compass size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project <span className="text-brand-600">Odyssey</span></h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-brand-600 transition-colors">New Trip</a>
            <a href="#" className="hover:text-brand-600 transition-colors">History</a>
            <div className="flex items-center space-x-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-100">
               <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
               <span className="text-xs">Gemini 2.5 Flash Active</span>
            </div>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;