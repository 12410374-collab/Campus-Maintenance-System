import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#eef2f9] relative overflow-x-clip">
      {/* Subtle Layered Atmospheric Background (Soft Blue-Gray & Lavender tint) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-0 w-[520px] h-[520px] rounded-full bg-indigo-200/35 blur-[130px]"></div>
        <div className="absolute bottom-0 left-1/3 w-[440px] h-[440px] rounded-full bg-purple-200/25 blur-[130px]"></div>
      </div>

      {/* Fixed Full-Viewport Left Sidebar with responsive mobile drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Column offset cleanly by sidebar width (w-72 = 18rem) */}
      <div className="relative z-10 flex flex-col min-w-0 min-h-dvh lg:pl-72">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
