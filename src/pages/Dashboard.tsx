import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Personnel } from "@/components/dashboard/Personnel";
import { Announcements } from "@/components/dashboard/Announcements";
import { NotificationSystem } from "@/components/dashboard/NotificationSystem";

type Page = "dashboard" | "personnel" | "announcements";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const renderContent = () => {
    switch (currentPage) {
      case "personnel":
        return <Personnel />;
      case "announcements":
        return <Announcements />;
      default:
        return (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center">
                <i className="fas fa-chart-line text-3xl text-primary"></i>
              </div>
              <h2 className="text-3xl font-bold">Dashboard U.O.P.I.</h2>
              <p className="text-muted-foreground max-w-md">
                Sistema di gestione operativa integrato. Seleziona una sezione dal menu di navigazione.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {renderContent()}
      </main>

      <NotificationSystem />
    </div>
  );
};

export default Dashboard;
