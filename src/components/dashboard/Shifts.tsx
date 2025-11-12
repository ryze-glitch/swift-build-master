import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Shift {
  id: string;
  officer: string;
  role: string;
  startTime: string;
  endTime: string;
  date: string;
  status: "active" | "scheduled" | "completed";
}

export const Shifts = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [shifts] = useState<Shift[]>([
    {
      id: "1",
      officer: "Agent. Rossi",
      role: "Pattugliamento",
      startTime: "08:00",
      endTime: "16:00",
      date: new Date().toISOString().split('T')[0],
      status: "active"
    },
    {
      id: "2",
      officer: "Agent. Bianchi",
      role: "Centrale Operativa",
      startTime: "16:00",
      endTime: "00:00",
      date: new Date().toISOString().split('T')[0],
      status: "scheduled"
    },
    {
      id: "3",
      officer: "Agent. Verdi",
      role: "Supervisione",
      startTime: "00:00",
      endTime: "08:00",
      date: new Date().toISOString().split('T')[0],
      status: "scheduled"
    },
  ]);

  const getStatusColor = (status: Shift['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Shift['status']) => {
    switch (status) {
      case 'active': return 'In Servizio';
      case 'scheduled': return 'Programmato';
      case 'completed': return 'Completato';
    }
  };

  const activeShifts = shifts.filter(s => s.status === 'active').length;
  const scheduledShifts = shifts.filter(s => s.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold">Gestione Turni</h2>
              <p className="text-muted-foreground">
                Pianificazione e monitoraggio turni operativi del personale
              </p>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-500 text-sm font-bold uppercase tracking-wider">
                  <i className="fas fa-calendar-alt"></i>
                  Scheduling
                </span>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="text-sm font-semibold text-muted-foreground mb-3">Data Selezionata</div>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Turni Attivi", value: activeShifts, icon: "fa-user-clock", color: "green-500" },
          { label: "Programmati", value: scheduledShifts, icon: "fa-calendar-check", color: "blue-500" },
          { label: "Totali Oggi", value: shifts.length, icon: "fa-list-ul", color: "purple-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</span>
              <i className={`fas ${stat.icon} text-2xl text-${stat.color}`}></i>
            </div>
            <div className="text-3xl font-extrabold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Shifts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Turni del {new Date(selectedDate).toLocaleDateString('it-IT')}</h3>
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all">
            <i className="fas fa-plus mr-2"></i>
            Nuovo Turno
          </button>
        </div>

        <div className="space-y-3">
          {shifts.map((shift) => (
            <Card key={shift.id} className="glass p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(shift.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-lg">{shift.officer}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(shift.status)} bg-opacity-20`}>
                        {getStatusText(shift.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{shift.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{shift.startTime} - {shift.endTime}</div>
                  <div className="text-sm text-muted-foreground">
                    <i className="fas fa-clock mr-1"></i>
                    {(() => {
                      const [startH, startM] = shift.startTime.split(':').map(Number);
                      const [endH, endM] = shift.endTime.split(':').map(Number);
                      let duration = (endH - startH) + (endM - startM) / 60;
                      if (duration < 0) duration += 24;
                      return `${duration.toFixed(1)} ore`;
                    })()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">
          <i className="fas fa-calendar-week mr-2 text-primary"></i>
          Panoramica Settimanale
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs font-semibold text-muted-foreground mb-2">{day}</div>
              <div className="h-24 rounded-xl bg-secondary/30 flex items-center justify-center">
                <div className="text-2xl font-bold">{Math.floor(Math.random() * 5) + 3}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">turni</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};