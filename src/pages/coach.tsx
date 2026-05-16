import { useState, useRef, useEffect } from "react";
import { useListOpenaiConversations, useCreateOpenaiConversation, useGetOpenaiConversation, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, User, Plus, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^[\-\*]\s+/gm, "• ")
    .trim();
}

export default function Coach() {
  const { data: conversations, isLoading: convsLoading } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();
  const deleteConversation = useDeleteOpenaiConversation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [pendingUserMsg, setPendingUserMsg] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Equipment Profile Sync Settings
  const [coachGymConfig, setCoachGymConfig] = useState("planet-fitness");

  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const { data: activeConv, isLoading: activeLoading } = useGetOpenaiConversation(
    activeConvId || 0,
    { query: { enabled: !!activeConvId, queryKey: ["getOpenaiConversation", activeConvId] } }
  );

  const handleNewChat = () => {
    createConversation.mutate({ data: { title: "New Training Chat" } }, {
      onSuccess: (newConv) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setActiveConvId(newConv.id);
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConversation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Session Deleted", description: "Conversation removed." });
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        if (activeConvId === id) setActiveConvId(null);
      }
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId || isStreaming) return;

    const userRawInput = input.trim();
    
    // Auto-inject system profile rules right into the prompt seamlessly contextually
    let processingPrompt = userRawInput;
    if (userRawInput.toLowerCase().includes("workout") || userRawInput.toLowerCase().includes("routine") || userRawInput.toLowerCase().includes("exercise")) {
      if (coachGymConfig === "planet-fitness") {
        processingPrompt += " (Note: Make sure this protocol fits Planet Fitness equipment rules perfectly. Avoid Olympic platform barbells or free squat racks. Build it explicitly utilizing heavy dumbbells up to 75lbs, adjustable pulley cable towers, and high-tension Smith Machines instead.)";
      } else if (coachGymConfig === "home-gym") {
        processingPrompt += " (Note: I am training with limited home gear. Please restrict your movement designs strictly to standard standalone dumbbell setups and basic structural bodyweight movements.)";
      } else if (coachGymConfig === "calisthenics") {
        processingPrompt += " (Note: I have zero equipment access. Build this program completely around high-intensity calisthenics, plyometrics, and explosive speed bodyweight protocols.)";
      }
    }

    setInput("");
    setPendingUserMsg(userRawInput);
    setIsStreaming(true);
    setStreamedResponse("");

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/openai/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: processingPrompt }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw) as { content?: string; done?: boolean };
            if (parsed.content) setStreamedResponse(prev => prev + parsed.content);
            if (parsed.done) break;
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      toast({ title: "Connection error", description: "Couldn't reach Coach Dre. Try again.", variant: "destructive" });
    } finally {
      setIsStreaming(false);
      setPendingUserMsg("");
      setStreamedResponse("");
      queryClient.invalidateQueries({ queryKey: ["getOpenaiConversation", activeConvId] });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages, streamedResponse, pendingUserMsg]);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        <Button
          onClick={handleNewChat}
          disabled={createConversation.isPending}
          className="w-full uppercase font-bold tracking-wider rounded-none bg-primary text-black hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New Session
        </Button>

        {/* Coach Gym Context Switcher */}
        <div className="p-3 border border-border/50 bg-sidebar/30 space-y-1.5">
          <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-white/30 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 text-primary" /> Active Gym Profile
          </label>
          <Select value={coachGymConfig} onValueChange={setCoachGymConfig}>
            <SelectTrigger className="bg-white/5 border-white/10 text-xs font-bold uppercase tracking-wider text-white h-8 rounded-none w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 rounded-none">
              <SelectItem value="planet-fitness" className="text-xs uppercase font-bold tracking-wider">Planet Fitness</SelectItem>
              <SelectItem value="gold-gym" className="text-xs uppercase font-bold tracking-wider">Gold's / Heavy Barbell</SelectItem>
              <SelectItem value="home-gym" className="text-xs uppercase font-bold tracking-wider">Dumbbells Only</SelectItem>
              <SelectItem value="calisthenics" className="text-xs uppercase font-bold tracking-wider">Bodyweight Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1 border border-border/50 bg-sidebar/50">
          <div className="p-2 space-y-1">
            {convsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : conversations?.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-none transition-colors cursor-pointer group flex items-center justify-between ${
                  activeConvId === conv.id
                    ? "bg-primary/20 text-primary font-bold border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <span className="truncate pr-2">{conv.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/20"
                  onClick={(e) => handleDelete(e, conv.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Card className="flex-1 flex flex-col bg-card/30 border-border/50 overflow-hidden rounded-none">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {!activeConvId ? (
            <div className="h-full flex items-center justify-center text-muted-foreground uppercase font-bold tracking-wider text-center px-4">
              Tap "New Session" and ask Coach Dre anything — form, nutrition, recruiting, mindset.
            </div>
          ) : activeLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 ml-auto" />
              <Skeleton className="h-24 w-3/4" />
            </div>
          ) : (
            <>
              {activeConv?.messages?.map((msg, i) => (
                <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`shrink-0 w-8 h-8 flex items-center justify-center ${msg.role === "user" ? "bg-secondary" : "bg-primary text-black"}`}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-secondary/50 text-white"
                      : "bg-card border border-border/50 text-foreground"
                  }`}>
                    {msg.role === "assistant" ? stripMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              ))}

              {pendingUserMsg && (
                <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-secondary">
                    <User size={16} />
                  </div>
                  <div className="p-3 text-sm bg-secondary/50 text-white">
                    {pendingUserMsg}
                  </div>
                </div>
              )}

              {(streamedResponse || isStreaming) && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-black">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 text-sm bg-card border border-border/50 text-foreground leading-relaxed whitespace-pre-wrap">
                    {streamedResponse ? stripMarkdown(streamedResponse) : <span className="animate-pulse text-muted-foreground">Coach Dre is thinking...</span>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-sidebar border-t border-border/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={coachGymConfig === "planet-fitness" ? "Ask coach for a PF-optimized protocol..." : "Ask coach about recovery, form, or macros..."}
              disabled={!activeConvId || isStreaming}
              className="bg-background border-border/50 rounded-none focus-visible:ring-primary"
            />
            <Button
              type="submit"
              disabled={!activeConvId || isStreaming || !input.trim()}
              className="rounded-none bg-primary text-black hover:bg-primary/90"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
