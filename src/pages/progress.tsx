import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

// Optimized specifically for Planet Fitness & D1 Athletic Metrics
const METRICS = [
  { value: "weight", label: "Body Weight", unit: "lbs", color: "#ef4444" },
  { value: "fortyYardDash", label: "40-Yard Dash", unit: "sec", color: "#06b6d4" },
  { value: "smithMachineBench", label: "Smith Machine Bench", unit: "lbs", color: "#8b5cf6" },
  { value: "dumbbellPressMax", label: "Dumbbell Press (Per Hand)", unit: "lbs", color: "#10b981" },
  { value: "verticalJump", label: "Vertical Jump", unit: "in", color: "#f59e0b" },
];

interface ProgressEntry {
  id: string;
  metric: string;
  value: string;
  unit: string;
  notes: string;
  loggedAt: string;
}

export default function Progress() {
  const { toast } = useToast();
  const [metric, setMetric] = useState(METRICS[0].value);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  
  // Local state to hold entries so the page functions without a broken database backend
  const [entries, setEntries] = useState<ProgressEntry[]>([
    {
      id: "1",
      metric: "smithMachineBench",
      value: "260",
      unit: "lbs",
      notes: "Clean reps, hitting chest perfectly",
      loggedAt: new Date().toISOString()
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    
    const selectedMetric = METRICS.find(m => m.value === metric);
    
    const newEntry: ProgressEntry = {
      id: Date.now().toString(),
      metric,
      value,
      unit: selectedMetric?.unit || "lbs",
      notes,
      loggedAt: new Date().toISOString()
    };

    setEntries([newEntry, ...entries]);
    setValue(""); 
    setNotes("");
    
    toast({ 
      title: "Metric Logged", 
      description: `${selectedMetric?.label} progress recorded.` 
    });
  };

  const selected = METRICS.find(m => m.value === metric);

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <div className="section-label">Progress Tracking</div>
        <h1 className="text-3xl font-black uppercase text-white" style={{ letterSpacing: "-0.04em" }}>Measure Gains</h1>
      </div>

      {/* Log form */}
      <div>
        <div className="section-label">Log Metric</div>
        <div className="glass p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Metric</label>
                <Select value={metric} onValueChange={setMetric}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#8b5cf6] rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 rounded-none">
                    {METRICS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">
                  Value ({selected?.unit})
                </label>
                <Input type="number" step="0.01" required value={value}
                  onChange={e => setValue(e.target.value)}
                  className="bg-white/5 border-white/10 focus-visible:ring-[#8b5cf6] text-white rounded-none" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Notes (Optional)</label>
                <Input value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Clean reps, hitting depth on Smith machine..."
                  className="bg-white/5 border-white/10 focus-visible:ring-[#8b5cf6] text-white placeholder:text-white/20 rounded-none" />
              </div>
            </div>
            <button type="submit" className="btn-grad w-full py-2.5 text-xs flex items-center justify-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Log Metric
            </button>
          </form>
        </div>
      </div>

      {/* History timeline */}
      <div>
        <div className="section-label">History</div>
        {entries.length === 0 ? (
          <div className="glass p-8 text-center border-dashed">
            <div className="text-sm text-white/30 font-bold uppercase tracking-wider">No metrics logged yet</div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/[0.06]" />
            <div className="space-y-3 pl-8">
              {entries.map((entry) => {
                const m = METRICS.find(mx => mx.value === entry.metric);
                return (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[21px] w-3 h-3 rounded-full border-2 border-[#080808]"
                      style={{ background: m?.color ?? "#8b5cf6", top: "50%", transform: "translateY(-50%)" }} />
                    <div className="glass flex items-center justify-between gap-4 p-4 border-l-2"
                      style={{ borderLeftColor: m?.color ?? "#8b5cf6" }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-0.5 text-white/30">
                          {new Date(entry.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-sm font-black uppercase text-white" style={{ letterSpacing: "-0.02em" }}>
                          {m?.label || entry.metric}
                        </div>
                        {entry.notes && <div className="text-xs text-white/30 mt-0.5 truncate">{entry.notes}</div>}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-2xl font-black" style={{ color: m?.color ?? "#8b5cf6", letterSpacing: "-0.04em" }}>
                          {entry.value}
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-white/25 font-bold">{entry.unit || m?.unit}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
