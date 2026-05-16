import { useState } from "react";
import { useGetAthleteStats, useGetTodayWorkout, useGetNutritionSummary, useGetAthleteProfile } from "@workspace/api-client-react";
import { Activity, Flame, Zap, Trophy, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function GlassCard({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`glass p-4 ${accent ? "border-l-2 border-l-[#8b5cf6]" : ""} ${className}`}>
      {children}
    </div>
  );
}

function StatBig({ label, value, suffix = "", color }: { label: string; value: string | number; suffix?: string; color: string }) {
  return (
    <div className="glass p-4">
      <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
      <div className="text-3xl font-black leading-none" style={{ color, letterSpacing: "-0.04em" }}>
        {value}<span className="text-base font-bold ml-0.5 opacity-60">{suffix}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAthleteStats();
  const { data: todayWorkout, isLoading: workoutLoading } = useGetTodayWorkout();
  const { data: nutrition, isLoading: nutritionLoading } = useGetNutritionSummary();
  const { data: profile } = useGetAthleteProfile();

  // Gym selection state
  const [selectedGym, setSelectedGym] = useState("planet-fitness");

  const calPct = Math.min(100, ((nutrition?.totalCalories ?? 0) / (nutrition?.calorieGoal ?? 4000)) * 100);
  const proteinPct = Math.min(100, ((nutrition?.totalProtein ?? 0) / (nutrition?.proteinGoal ?? 200)) * 100);

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="pt-2 flex justify-between items-start">
        <div>
          <div className="section-label">Performance Overview</div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {profile?.name ? profile.name.split(" ")[0] : "Athlete"}
          </h1>
          {(profile?.position || profile?.school) && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {profile.position && (
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 border"
                  style={{ color: "#f87171", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
                  {profile.position}
                </span>
              )}
              {profile.school && (
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 border"
                  style={{ color: "#c4b5fd", borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)" }}>
                  {profile.school}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Gym Equipment Selector */}
        <div className="w-40">
          <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-white/30 block mb-1 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 text-[#ef4444]" /> Gym Setup
          </label>
          <Select value={selectedGym} onValueChange={setSelectedGym}>
            <SelectTrigger className="bg-white/5 border-white/10 text-xs font-bold uppercase tracking-wider text-white h-8 rounded-none">
              <SelectValue placeholder="Select Gym" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 rounded-none">
              <SelectItem value="planet-fitness" className="text-xs uppercase font-bold tracking-wider">Planet Fitness</SelectItem>
              <SelectItem value="gold-gym" className="text-xs uppercase font-bold tracking-wider">Barbell/Gold's Gym</SelectItem>
              <SelectItem value="home-gym" className="text-xs uppercase font-bold tracking-wider">Dumbbell Only</SelectItem>
              <SelectItem value="calisthenics" className="text-xs uppercase font-bold tracking-wider">Bodyweight/No Gear</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gym Equipment Status Note */}
      <div className="p-3 bg-white/[0.02] border border-white/5 text-[11px] font-medium text-white/50 tracking-wide">
        {selectedGym === "planet-fitness" && "⚠️ AI Coach Mode: Protocols optimized for Smith Machines, Cables, and Dumbbells up to 75lbs (No free barbells)."}
        {selectedGym === "gold-gym" && "⚡ AI Coach Mode: Full access enabled. Heavy barbell complexes and free racks included."}
        {selectedGym === "home-gym" && "🏡 AI Coach Mode: Limited gear. Workouts structured around standard dumbbell variations."}
        {selectedGym === "calisthenics" && "🏃 AI Coach Mode: Zero gear required. High-intensity bodyweight explosion protocols active."}
      </div>

      {/* Athlete scores */}
      <div>
        <div className="section-label">Athlete Scores</div>
        {statsLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[0,1,2].map(i => <Skeleton key={i} className="h-20 bg-white/5" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <StatBig label="Explosion" value={stats?.explosionScore ?? 0} color="#ef4444" />
            <StatBig label="Strength" value={stats?.strengthScore ?? 0} color="#8b5cf6" />
            <StatBig label="Speed" value={stats?.speedScore ?? 0} color="#06b6d4" />
          </div>
        )}
        {!statsLoading && (
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { val: stats?.explosionScore ?? 0, color: "#ef4444" },
              { val: stats?.strengthScore ?? 0, color: "#8b5cf6" },
              { val: stats?.speedScore ?? 0, color: "#06b6d4" },
            ].map((s, i) => (
              <div key={i} className="h-1 bg-white/5">
                <div className="h-full transition-all" style={{ width: `${s.val}%`, background: s.color }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's workout */}
      <div>
        <div className="section-label">Today's Protocol</div>
        {workoutLoading ? (
          <Skeleton className="h-28 bg-white/5" />
        ) : todayWorkout ? (
          <div className="glass border-l-2 border-l-[#ef4444] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1.5" style={{ color: "#ef4444" }}>{todayWorkout.category}</div>
                <div className="text-lg font-black uppercase text-white" style={{ letterSpacing: "-0.02em" }}>
                  {selectedGym === "planet-fitness" && todayWorkout.title.includes("Barbell") 
                    ? todayWorkout.title.replace("Barbell", "Smith Machine") 
                    : todayWorkout.title}
                </div>
                {todayWorkout.description && (
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {selectedGym === "planet-fitness" 
                      ? "Modified for Planet Fitness equipment rules. Focus on high tension control." 
                      : todayWorkout.description}
                  </div>
                )}
              </div>
              {todayWorkout.completed && (
                <div className="shrink-0 w-8 h-8 flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                  <Trophy className="h-4 w-4" style={{ color: "#8b5cf6" }} />
                </div>
              )}
            </div>
            <Link href="/workouts">
              <button className="btn-grad w-full mt-4 py-2.5 text-xs">
                {todayWorkout.completed ? "View Details" : "Start Protocol"}
              </button>
            </Link>
          </div>
        ) : (
          <div className="glass p-6 text-center border-dashed">
            <div className="text-sm font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Rest day — recover and rebuild</div>
            <Link href="/workouts">
              <button className="mt-4 text-xs font-bold uppercase tracking-wider px-4 py-2 border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                Browse Protocols
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Nutrition snapshot */}
      <div>
        <div className="section-label">Fuel Status</div>
        {nutritionLoading ? (
          <Skeleton className="h-32 bg-white/5" />
        ) : (
          <div className="glass p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Calories</div>
                <div className="text-2xl font-black" style={{ color: "#ef4444", letterSpacing: "-0.04em" }}>
                  {nutrition?.totalCalories ?? 0}
                  <span className="text-xs font-normal ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>/ {nutrition?.calorieGoal ?? 4000}</span>
                </div>
                <div className="h-1 bg-white/5 mt-2">
                  <div className="h-full bg-[#ef4444] transition-all" style={{ width: `${calPct}%` }} />
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Protein</div>
                <div className="text-2xl font-black" style={{ color: "#8b5cf6", letterSpacing: "-0.04em" }}>
                  {nutrition?.totalProtein ?? 0}g
                  <span className="text-xs font-normal ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>/ {nutrition?.proteinGoal ?? 200}g</span>
                </div>
                <div className="h-1 bg-white/5 mt-2">
                  <div className="h-full bg-[#8b5cf6] transition-all" style={{ width: `${proteinPct}%` }} />
                </div>
              </div>
            </div>
            <Link href="/nutrition">
              <button className="btn-grad w-full py-2.5 text-xs mt-2">Log Fuel</button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick nav tiles */}
      <div>
        <div className="section-label">Quick Access</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/coach", icon: "🏈", label: "Ask Coach Dre", sub: "AI coaching", color: "#ef4444" },
            { href: "/nutrition", icon: "📷", label: "Scan Food", sub: "AI analyzer", color: "#8b5cf6" },
            { href: "/progress", icon: "📊", label: "Log Metric", sub: "Track gains", color: "#06b6d4" },
            { href: "/recovery", icon: "😴", label: "Recovery", sub: "Sleep & water", color: "#f59e0b" },
          ].map(({ href, icon, label, sub, color }) => (
            <Link key={href} href={href}>
              <div className="glass p-4 cursor-pointer hover:bg-white/[0.06] transition-colors group"
                style={{ borderLeft: `2px solid ${color}20` }}>
                <div className="text-xl mb-2">{icon}</div>
                <div className="text-sm font-black uppercase text-white" style={{ letterSpacing: "-0.02em" }}>{label}</div>
                <div className="text-[10px] mt-0.5 uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
