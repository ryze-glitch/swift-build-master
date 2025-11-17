export const Footer = () => {
  return (
    <footer className="glass-strong border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <i className="fas fa-exclamation-triangle mr-2 text-warning"></i>
            <strong>DISCLAIMER:</strong> Questo sito non è in alcun modo collegato, affiliato o associato alla Polizia di Stato italiana o alle Unità Operative di Pronto Intervento (U.O.P.I.) reali. 
            Si tratta di un progetto indipendente a scopo dimostrativo e formativo.
          </p>
          <p className="text-xs text-muted-foreground/60">
            © 2025 Dashboard U.O.P.I. - Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  );
};
