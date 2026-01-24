import React from 'react';

const Page = ({ children, title, className = '' }) => {
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${className}`}>
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {title && <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>}
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          © 2024 Resume Builder AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Page;