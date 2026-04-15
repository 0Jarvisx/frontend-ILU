import React from 'react';
import SideNavBar from './SideNavBar';
import TopNavBar from './TopNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-surface dark:text-stone-100 antialiased min-h-screen flex font-body">
      <SideNavBar />
      <main className="w-full md:pl-64 min-h-screen pb-16 md:pb-0 flex flex-col bg-[#faf9f6] dark:bg-transparent overflow-hidden">
        <TopNavBar />
        <div className="flex-1 mt-16 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
