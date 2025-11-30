import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-roseTheme-soft">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;