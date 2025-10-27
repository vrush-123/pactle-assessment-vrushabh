// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { TopBar } from '../ui/TopBar';

export const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopBar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};