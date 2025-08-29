
import React from 'react';

function Header() {
  return (
    <header className="bg-gray-900 text-white px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-400">boot</span>
          <span className="text-2xl font-light">Lab</span>
        </div>
        <div className="text-sm text-gray-300">
          Reacondicioná tu PC - Canje
        </div>
      </div>
    </header>
  );
}

export default Header;
