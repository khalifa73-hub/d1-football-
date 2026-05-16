import React, { useState } from "react";
import { Activity, Flame, Zap, Trophy, MapPin } from "lucide-react";
import { Link } from "wouter";

// --- MOCK BACKEND DATA HOOKS (Fixes the missing package error) ---
const useGetAthleteStats = () => ({
  data: { explosionScore: 92, strengthScore: 88, speedScore: 95 },
  isLoading: false
});

const useGetTodayWorkout = () => ({
  data: {
    category: "Power & Lower Body Explosion",
    title: "Barbell Clean & Front Squat Complexes",
    description: "Focus on maximum hip extension and explosive drive out of the hole.",
    completed: false
  },
  isLoading: false
});

const useGetNutritionSummary = () => ({
  data: { totalCalories: 2850, calorieGoal: 4000, totalProtein: 165, proteinGoal: 220 },
  isLoading: false
});

const useGetAthleteProfile = () => ({
  data: { name: "Player 1", position: "WR / DB", school: "Varsity Elite" },
  isLoading: false
});

// --- MOCK SKELETON COMPONENT ---
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} />;
}

// --- MOCK SELECT COMPONENTS (Fixes shadcn component requirement) ---
function Select({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (v: string) => void }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      style={{
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        height: '32px',
        padding: '0 8px',
        outline: 'none',
        cursor: 'pointer'
      }}
    >
      {children}
    </select>
  );
}
function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) { return <>{children}</>; }
function SelectValue({ placeholder }: { placeholder?: string }) { return null; }
function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) { return <>{children}</>; }
function SelectItem({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
  return <option value={value} style={{ background: '#111', color: '#fff' }}>{children}</option>;
}

// --- ORIGINAL CUSTOM COMPONENTS ---
function GlassCard({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`glass p-4 ${accent ? "border-l-2 border-l-[#8b5cf6]" : ""} ${className}`}>
      {children}
    </div>
  );
}

function StatBig({ label, value, suffix = "", color }: { label: string; value: string | number; suffix?: string; color: string }) {
  return (
    <div className="glass p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
      <div className="text-3xl font-black leading-none" style={{ color, letterSpacing: "-0.04em" }}>
        {value}<span className="text-base font-bold ml-0.5 opacity-60">{suffix}</span>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD EXPORT ---
export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAthleteStats();
  const { data: todayWorkout, isLoading: workoutLoading } = useGetTodayWorkout();
  const { data: nutrition, isLoading: nutritionLoading } = useGetNutritionSummary();
  const { data: profile } = useGetAthleteProfile();

  const [selectedGym, setSelectedGym] = useState("planet-fitness");

  const calPct = Math.min(100, ((nutrition?.totalCalories ?? 0) / (nutrition?.calorieGoal ?? 4000)) * 100);
  const proteinPct = Math.min(100, ((nutrition?.totalProtein ?? 0) / (nutrition?.proteinGoal ?? 200)) * 100);

  return (
    <div className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero header */}
      <div className="pt-2 flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="section-label" style={{ fontSize: '10px', uppercase: true, tracking: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Performance Overview</div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white" style={{ letterSpacing: "-0.04em", fontSize: '2rem', fontWeight: 900, color: '#fff', margin: 0 }}>
            {profile?.name ? profile.name.split(" ")[0] : "Athlete"}
          </h1>
          {(profile?.position || profile?.school) && (
            <div className="flex gap-2 mt-2 flex-wrap" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {profile.position && (
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 border"
                  style={{ color: "#f87171", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", fontSize: '10px', padding: '2px 6px', fontWeight: 'bold' }}>
                  {profile.position}
                </span>
              )}
              {profile.school && (
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 border"
                  style={{ color: "#c4b5fd", borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", fontSize: '10px', padding: '2px 6px', fontWeight: 'bold' }}>
                  {profile.school}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Gym Equipment Selector */}
        <div className="w-40" style={{ width: '160px' }}>
          <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-white/30 block mb-1 flex items-center gap-1" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <MapPin className="h-2.5 w-2.5 text-[#ef4444]" style={{ width: '10px', height: '10px', color: '#ef4444' }} /> Gym Setup
          </label>
          <Select value={selectedGym} onValueChange={setSelectedGym}>
            <SelectItem value="planet-fitness">Planet Fitness</SelectItem>
            <SelectItem value="gold-gym">Barbell/Gold's Gym</SelectItem>
            <SelectItem value="home-gym">Dumbbell Only</SelectItem>
            <SelectItem value="calisthenics">Bodyweight/No Gear</SelectItem>
          </Select>
        </div>
      </div>

      {/* Gym Equipment Status Note */}
      <div className="p-3 bg-white/[0.02] border border-white/5 text-[11px] font-medium text-white/50 tracking-wide" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
        {selectedGym === "planet-fitness" && "⚠️ AI Coach Mode: Protocols optimized for Smith Machines, Cables, and Dumbbells up to 75lbs (No free barbells)."}
        {selectedGym === "gold-gym" && "⚡ AI Coach Mode: Full access enabled. Heavy barbell complexes and free racks included."}
        {selectedGym === "home-gym" && "🏡 AI Coach Mode: Limited gear. Workouts structured around standard dumbbell variations."}
        {selectedGym === "calisthenics" && "🏃 AI Coach Mode: Zero gear required. High-intensity bodyweight explosion protocols active."}
      </div>

      {/* Athlete scores */}
      <div>
        <div className="section-label" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold', uppercase: true }}>Athlete Scores</div>
        {statsLoading ? (
          <div className="grid grid-cols-3 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[0,1,2].map(i => <Skeleton key={i} className="h-20 bg-white/5" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <StatBig label="Explosion" value={stats?.explosionScore ?? 0} color="#ef4444" />
            <StatBig label="Strength" value={stats?.strengthScore ?? 0} color="#8b5cf6" />
            <StatBig label="Speed" value={stats?.speedScore ?? 0} color="#06b6d4" />
          </div>
        )}
        {!statsLoading && (
          <div className="grid grid-cols-3 gap-2 mt-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
            {[
              { val: stats?.explosionScore ?? 0, color: "#ef4444" },
              { val: stats?.strengthScore ?? 0, color: "#8b5cf6" },
              { val: stats?.speedScore ?? 0, color: "#06b6d4" },
            ].map((s, i) => (
              <div key={i} className="h-1 bg-white/5" style={{ height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full transition-all" style={{ width: `${s.val}%`, background: s.color, height: '100%' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's workout */}
      <div>
        <div className="section-label" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold', uppercase: true }}>Today's Protocol</div>
        {workoutLoading ? (
          <Skeleton className="h-28 bg-white/5" />
        ) : todayWorkout ? (
          <div className="glass border-l-2 border-l-[#ef4444] p-4" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #ef4444' }}>
            <div className="flex items-start justify-between gap-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1.5" style={{ color: "#ef4444", fontSize: '9px', fontWeight: 'bold', marginBottom: '6px' }}>{todayWorkout.category}</div>
                <div className="text-lg font-black uppercase text-white" style={{ letterSpacing: "-0.02em", fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                  {selectedGym === "planet-fitness" && todayWorkout.title.includes("Barbell") 
                    ? todayWorkout.title.replace("Barbell", "Smith Machine") 
                    : todayWorkout.title}
                </div>
                {todayWorkout.description && (
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontSize: '12px', marginTop: '4px' }}>
                    {selectedGym === "planet-fitness" 
                      ? "Modified for Planet Fitness equipment rules. Focus on high tension control." 
                      : todayWorkout.description}
                  </div>
                )}
              </div>
              {todayWorkout.completed && (
                <div className="shrink-0 w-8 h-8 flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", padding: '4px' }}>
                  <Trophy className="h-4 w-4" style={{ color: "#8b5cf6", width: '16px', height: '16px' }} />
                </div>
              )}
            </div>
            <Link href="/workouts">
              <button style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'linear-gradient(135deg, #ef4444, #8b5cf6)', border: 'none', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', cursor: 'pointer' }}>
                {todayWorkout.completed ? "View Details" : "Start Protocol"}
              </button>
            </Link>
          </div>
        ) : (
          <div className="glass p-6 text-center border-dashed">
            <div className="text-sm font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Rest day — recover and rebuild</div>
          </div>
        )}
      </div>

      {/* Nutrition snapshot */}
      <div>
        <div className="section-label" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold', uppercase: true }}>Fuel Status</div>
        {nutritionLoading ? (
          <Skeleton className="h-32 bg-white/5" />
        ) : (
          <div className="glass p-4 space-y-4" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Calories</div>
                <div className="text-2xl font-black" style={{ color: "#ef4444", letterSpacing: "-0.04em", fontSize: '1.5rem', fontWeight: 900 }}>
                  {nutrition?.totalCalories ?? 0}
                  <span className="text-xs font-normal ml-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: '12px' }}>/ {nutrition?.calorieGoal ?? 4000}</span>
                </div>
                <div className="h-1 bg-white/5 mt-2" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', marginTop: '8px' }}>
                  <div className="h-full bg-[#ef4444] transition-all" style={{ width: `${calPct}%`, height: '100%', background: '#ef4444' }} />
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Protein</div>
                <div className="text-2xl font-black" style={{ color: "#8b5cf6", letterSpacing: "-0.04em", fontSize: '1.5rem', fontWeight: 900 }}>
                  {nutrition?.totalProtein ?? 0}g
                  <span className="text-xs font-normal ml-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: '12px' }}>/ {nutrition?.proteinGoal ?? 200}g</span>
                </div>
                <div className="h-1 bg-white/5 mt-2" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', marginTop: '8px' }}>
                  <div className="h-full bg-[#8b5cf6] transition-all" style={{ width: `${proteinPct}%`, height: '100%', background: '#8b5cf6' }} />
                </div>
              </div>
            </div>
            <Link href="/nutrition">
              <button style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #ef4444, #8b5cf6)', border: 'none', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', cursor: 'pointer' }}>Log Fuel</button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick nav tiles */}
      <div>
        <div className="section-label" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 'bold', uppercase: true }}>Quick Access</div>
        <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { href: "/coach", icon: "🏈", label: "Ask Coach Dre", sub: "AI coaching", color: "#ef4444" },
            { href: "/nutrition", icon: "📷", label: "Scan Food", sub: "AI analyzer", color: "#8b5cf6" },
            { href: "/progress", icon: "📊", label: "Log Metric", sub: "Track gains", color: "#06b6d4" },
            { href: "/recovery", icon: "😴", label: "Recovery", sub: "Sleep & water", color: "#f59e0b" },
          ].map(({ href, icon, label, sub, color }) => (
            <Link key={href} href={href}>
              <div className="glass p-4 cursor-pointer hover:bg-white/[0.06] transition-colors group"
                style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${color}`, cursor: 'pointer' }}>
                <div className="text-xl mb-2" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
                <div className="text-sm font-black uppercase text-white" style={{ letterSpacing: "-0.02em", fontWeight: 900, color: '#fff', fontSize: '14px' }}>{label}</div>
                <div className="text-[10px] mt-0.5 uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.3)", fontSize: '10px', marginTop: '2px' }}>{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
