import { useState, useRef } from "react";
import { useListMeals, useLogMeal, useGetNutritionSummary, useAnalyzeMeal, getListMealsQueryKey, getGetNutritionSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanBarcode, Type, X, Send, Droplet } from "lucide-react";
import { format } from "date-fns";

type LogMode = "text" | "photo";

function parseAiResponse(raw: unknown) {
  return raw as { name: string; calories: number; protein: number; carbs: number; fat: number; athleteFeedback: string };
}

export default function Nutrition() {
  const [mode, setMode] = useState<LogMode>("text");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime] = useState("image/jpeg");
  const [photoNotes, setPhotoNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // Dynamic state for the new premium hydration tracker feature
  const [waterOunces, setWaterOunces] = useState(0);
  const fluidGoal = 128; // 1 Gallon target baseline for D1 athletic output

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: allMeals, isLoading: mealsLoading } = useListMeals();
  const todayStr = new Date().toDateString();
  const meals = allMeals?.filter(m => new Date(m.loggedAt).toDateString() === todayStr);
  const { data: summary, isLoading: summaryLoading } = useGetNutritionSummary();
  const analyzeMeal = useAnalyzeMeal();
  const logMeal = useLogMeal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListMealsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetNutritionSummaryQueryKey() });
  };

  const logAnalysis = (analysis: ReturnType<typeof parseAiResponse>) => {
    logMeal.mutate({ data: { name: analysis.name, calories: analysis.calories, protein: analysis.protein, carbs: analysis.carbs, fat: analysis.fat, notes: analysis.athleteFeedback } }, {
      onSuccess: () => {
        setDescription(""); setImagePreview(null); setImageBase64(null); setPhotoNotes("");
        toast({ title: "Fuel Logged", description: analysis.athleteFeedback });
        invalidate();
      }
    });
  };

  const handleTextAnalyze = () => {
    if (!description.trim()) return;
    analyzeMeal.mutate({ data: { description } }, {
      onSuccess: (a) => logAnalysis(parseAiResponse(a)),
      onError: () => toast({ title: "Couldn't analyze that", description: "Try again.", variant: "destructive" }),
    });
  };

  const handleImageFile = (file: File) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    img.src = objectUrl;
  };

  const handleImageAnalyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/meals/analyze-image`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: imageMime, notes: photoNotes.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      logAnalysis(parseAiResponse(await res.json()));
    } catch {
      toast({ title: "Couldn't read the photo", description: "Try a clearer pic or describe it instead.", variant: "destructive" });
    } finally { setAnalyzing(false); }
  };

  const addWater = (oz: number) => {
    setWaterOunces(prev => {
      const next = prev + oz;
      if (next >= fluidGoal && prev < fluidGoal) {
        toast({ title: "Hydration Target Met", description: "Cramps minimized. Cells fully regularized." });
      }
      return next;
    });
  };

  const isPending = analyzeMeal.isPending || logMeal.isPending || analyzing;

  const calPct = Math.min(100, ((summary?.totalCalories ?? 0) / (summary?.calorieGoal ?? 4000)) * 100);
  const proteinPct = Math.min(100, ((summary?.totalProtein ?? 0) / (summary?.proteinGoal ?? 220)) * 100);
  const carbPct = Math.min(100, ((summary?.totalCarbs ?? 0) / 400) * 100);
  const fatPct = Math.min(100, ((summary?.totalFat ?? 0) / 100) * 100);
  const waterPct = Math.min(100, (waterOunces / fluidGoal) * 100);

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <div className="section-label">Nutrition</div>
        <h1 className="text-3xl font-black uppercase text-white" style={{ letterSpacing: "-0.04em" }}>Fuel the Engine</h1>
      </div>

      {/* Daily summary */}
      <div>
        <div className="section-label">Today's Intake</div>
        <div className="glass p-4">
          {summaryLoading ? <Skeleton className="h-32 bg-white/5" /> : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/[0.03] border border-white/[0.05] border-l-2 border-l-[#ef4444]">
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold mb-1">Calories</div>
                  <div className="text-2xl font-black text-white" style={{ letterSpacing: "-0.04em" }}>{summary?.totalCalories ?? 0}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">/ {summary?.calorieGoal ?? 4000}</div>
                  <div className="h-1 bg-white/5 mt-2"><div className="h-full bg-[#ef4444]" style={{ width: `${calPct}%` }} /></div>
                </div>
                <div className="p-3 bg-white/[0.03] border border-white/[0.05] border-l-2 border-l-[#8b5cf6]">
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold mb-1">Protein</div>
                  <div className="text-2xl font-black text-white" style={{ letterSpacing: "-0.04em" }}>{summary?.totalProtein ?? 0}g</div>
                  <div className="text-[10px] text-white/30 mt-0.5">/ {summary?.proteinGoal ?? 220}g</div>
                  <div className="h-1 bg-white/5 mt-2"><div className="h-full bg-[#8b5cf6]" style={{ width: `${proteinPct}%` }} /></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-3 text-[10px] text-white/30 font-bold uppercase tracking-wider justify-between">
                  <span>Carbs {summary?.totalCarbs ?? 0}g</span>
                  <span>Fat {summary?.totalFat ?? 0}g</span>
                </div>
                <div className="flex h-2 w-full bg-white/5 overflow-hidden">
                  <div style={{ width: `${proteinPct * 0.4}%`, background: "#8b5cf6" }} />
                  <div style={{ width: `${carbPct * 0.4}%`, background: "#06b6d4" }} />
                  <div style={{ width: `${fatPct * 0.2}%`, background: "#f59e0b" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Hydration Feature Block */}
      <div>
        <div className="section-label">Hydration Protocol</div>
        <div className="glass p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold mb-1">
              <Droplet className="h-3 w-3 text-[#06b6d4]" /> Fluid Intake
            </div>
            <div className="text-2xl font-black text-white" style={{ letterSpacing: "-0.04em" }}>
              {waterOunces} <span className="text-xs font-normal text-white/40">oz / {fluidGoal} oz</span>
            </div>
            <div className="h-1 bg-white/5 mt-2.5 w-full">
              <div className="h-full bg-[#06b6d4] transition-all duration-300" style={{ width: `${waterPct}%` }} />
            </div>
          </div>
          <div className="flex gap-1 w-full sm:w-auto">
            <button onClick={() => addWater(16)} className="flex-1 sm:flex-none border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/5">
              +16oz
            </button>
            <button onClick={() => addWater(32)} className="flex-1 sm:flex-none border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/5">
              +32oz (Shaker)
            </button>
            <button onClick={() => setWaterOunces(0)} className="border border-white/10 px-2 py-1.5 text-white/30 hover:text-red-400">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Log fuel */}
      <div>
        <div className="section-label">Log Fuel</div>
        <div className="glass p-4 space-y-4">
          <div className="flex gap-2">
            {([["text", Type, "Describe"], ["photo", Camera, "Photo / Scan"]] as const).map(([m, Icon, label]) => (
              <button key={m} onClick={() => setMode(m as LogMode)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] border transition-colors"
                style={{
                  borderColor: mode === m ? "#8b5cf6" : "rgba(255,255,255,0.07)",
                  color: mode === m ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                  background: mode === m ? "rgba(139,92,246,0.08)" : "transparent",
                }}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {mode === "text" ? (
            <>
              <textarea
                placeholder="e.g. half a chicken breast, 4 cups rice, 2 eggs — describe it however"
                className="w-full min-h-[90px] bg-white/[0.03] border border-white/[0.07] p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] resize-none"
                value={description} onChange={e => setDescription(e.target.value)} />
              <button className="btn-grad w-full py-3 text-xs flex items-center justify-center gap-2"
                onClick={handleTextAnalyze} disabled={isPending || !description.trim()}>
                {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</> : <><Send className="h-3.5 w-3.5" /> Analyze & Log</>}
              </button>
            </>
          ) : (
            <>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Food" className="w-full h-48 object-cover" />
                  <button onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="absolute top-2 right-2 bg-black/70 p-1 text-white hover:bg-black">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 h-28 border border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-[#8b5cf6]/50 transition-colors">
                    <Camera className="h-7 w-7" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Camera</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 h-28 border border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-[#8b5cf6]/50 transition-colors">
                    <ScanBarcode className="h-7 w-7" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload / Barcode</span>
                  </button>
                </div>
              )}
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
              {imageBase64 && (
                <>
                  <textarea placeholder="Optional: only half, no dressing, extra chicken..."
                    className="w-full min-h-[50px] bg-white/[0.03] border border-white/[0.07] p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] resize-none"
                    value={photoNotes} onChange={e => setPhotoNotes(e.target.value)} />
                  <button className="btn-grad w-full py-3 text-xs flex items-center justify-center gap-2"
                    onClick={handleImageAnalyze} disabled={isPending}>
                    {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading photo...</> : <><Camera className="h-3.5 w-3.5" /> Log from Photo</>}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Today's log */}
      <div>
        <div className="section-label">Today's Log</div>
        <div className="space-y-2">
          {mealsLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 bg-white/5" />)
          ) : meals?.length === 0 ? (
            <div className="glass p-6 text-center border-dashed">
              <div className="text-sm text-white/30 font-bold uppercase tracking-wider">No fuel logged today</div>
            </div>
          ) : meals?.map((meal) => (
            <div key={meal.id} className="glass flex items-center justify-between gap-4 p-4 border-l-2 border-l-[#8b5cf6]">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-white uppercase truncate" style={{ letterSpacing: "-0.02em" }}>{meal.name}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{format(new Date(meal.loggedAt), 'h:mm a')}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {[
                  { val: meal.calories, label: "kcal", color: "#ef4444" },
                  { val: `${meal.protein}g`, label: "pro", color: "#8b5cf6" },
                  { val: `${meal.carbs}g`, label: "carb", color: "#06b6d4" },
                  { val: `${meal.fat}g`, label: "fat", color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-sm font-black" style={{ color: s.color, letterSpacing: "-0.02em" }}>{s.val}</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/25 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
