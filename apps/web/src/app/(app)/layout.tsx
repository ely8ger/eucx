import { Navbar }         from "@/components/layout/Navbar";
import { Sidebar }         from "@/components/layout/Sidebar";
import { ToastProvider }   from "@/components/ui/Toast";
import { QueryProvider }   from "@/providers/QueryProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
    <ToastProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-cb-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
    </QueryProvider>
  );
}
