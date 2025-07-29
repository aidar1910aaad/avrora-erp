import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm text-gray-900 flex items-center px-6 shadow-sm border-b border-gray-200/50 justify-between relative z-20">
      <h1 className="m-0 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AVHolding ERP</h1>
    </header>
  );
};

export default Header;
