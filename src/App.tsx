import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const ShutdownMessage = () => {
  const shutdownDate = new Date("2024-12-06");
  const now = new Date();
  const isShutdown = now >= shutdownDate;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-3xl text-destructive"></i>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground">
          {isShutdown ? "Sito Dismesso" : "Avviso di Dismissione"}
        </h1>
        
        <p className="text-muted-foreground text-lg">
          {isShutdown 
            ? "Questo sito è stato dismesso e non è più accessibile."
            : "Questo sito verrà dismesso in data 06/12/2024. Da quella data non sarà più possibile accedere."
          }
        </p>
        
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Per qualsiasi informazione, contattare l'amministrazione.
          </p>
        </div>
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
