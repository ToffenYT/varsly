import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Tag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export const KeywordManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newKeyword, setNewKeyword] = useState("");

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ["user_keywords", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_keywords")
        .select("id, keyword")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const addMutation = useMutation({
    mutationFn: async (keyword: string) => {
      if (!user?.id) throw new Error("Ikke innlogget");
      const { error } = await supabase.from("user_keywords").insert({
        user_id: user.id,
        keyword: keyword.trim(),
      });
      if (error) throw error;
    },
    onSuccess: (_, keyword) => {
      queryClient.invalidateQueries({ queryKey: ["user_keywords", user?.id] });
      toast.success(`Søkeord "${keyword}" lagt til!`);
      setNewKeyword("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_keywords").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_keywords", user?.id] });
      toast.info("Søkeord fjernet");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (keywords.some((k) => k.keyword.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Søkeordet finnes allerede");
      return;
    }
    addMutation.mutate(trimmed);
  };

  const removeKeyword = (id: string) => {
    removeMutation.mutate(id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card rounded-xl border border-border p-6 shadow-soft"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
          <Tag className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Mine søkeord</h3>
          <p className="text-sm text-muted-foreground">
            Du får varsler for anbud som inneholder disse ordene
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Legg til nytt søkeord..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
            disabled={addMutation.isPending}
          />
        </div>
        <Button
          onClick={addKeyword}
          disabled={!newKeyword.trim() || addMutation.isPending}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laster søkeord...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {keywords.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <Badge
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                  <span>{item.keyword}</span>
                  <button
                    onClick={() => removeKeyword(item.id)}
                    disabled={removeMutation.isPending}
                    className="w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && keywords.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Ingen søkeord lagt til ennå. Legg til ditt første søkeord ovenfor.
        </p>
      )}
    </motion.div>
  );
};
