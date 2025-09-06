import * as React from 'react';

const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <header className="w-full py-4 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700">
    <div className="max-w-full mx-auto px-3 flex justify-between items-center">
      {children}
    </div>
  </header>
);

export default Header;
