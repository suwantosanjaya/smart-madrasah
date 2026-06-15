"use client";

import { useState, createContext, useContext } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

const SidebarContext = createContext();
export const useSidebarContext = () => useContext(SidebarContext);

export default function DashboardLayoutClient({ children, session, madrasahName, teacherAccess }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen }}
    >
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <Sidebar session={session} madrasahName={madrasahName} teacherAccess={teacherAccess} />

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            sidebarOpen ? "lg:ml-[280px]" : "lg:ml-[72px]"
          }`}
        >
          <Header session={session} />
          <main className="flex-1 p-4 md:p-6 page-transition">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
