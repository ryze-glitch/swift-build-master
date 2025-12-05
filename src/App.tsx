import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const ShutdownMessage = () => {
  const shutdownDate = new Date("2024-12-06");
  const now = new Date();
  const isShutdown = now >= shutdownDate;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
          <i className="fas fa-heart text-4xl text-primary"></i>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Grazie a Tutti
          </h1>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            Un sincero ringraziamento a tutto il personale per l'eccellente operato svolto e per la dedizione dimostrata.
          </p>
        </div>

        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl space-y-3">
          <div className="flex items-center justify-center gap-2">
            <i className="fas fa-exclamation-circle text-destructive"></i>
            <span className="font-semibold text-destructive">Avviso Importante</span>
          </div>
          <p className="text-foreground">
            {isShutdown 
              ? "Tutti i sistemi sono stati disattivati."
              : "Tutti i sistemi andranno offline il 06/12/2024."
            }
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          U.O.P.I. - Unità Operativa Pronto Intervento
        </p>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<ShutdownMessage />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
